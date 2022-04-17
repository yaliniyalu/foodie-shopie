const {tgExecuteFindOne} = require("../../search-query");
const Schema = require("../../tg-schema");
const OrderHelper = require("../../helpers/order-helper");
const {createVertexQuery, tgUpsert, tgDeleteEdge, createEdgeQuery, createUID} = require("../../tg-helpers");
const Razorpay = require("razorpay");
const Joi = require("joi");

async function patchItemStatus(req, res) {
    const id = req.params.id
    try {
        const order = await tgExecuteFindOne({
            filter: {_id: id},
            include: 'details;details.item;coupon;assignedTo'
        }, Schema.SalesOrder.name)
        const orderHelper = new OrderHelper(order, req.user)


        if (!orderHelper.canI(OrderHelper.PERMISSION_ITEM_UPDATE_STATUS)) {
            if (!orderHelper.canIEdit()) {
                return res.sendError("You cannot perform this action. No Permission");
            }

            if (order.status !== OrderHelper.STATUS_PROCESSING) {
                return res.sendError("You cannot perform this action");
            }

            return res.sendError("Permission Denied");
        }

        const detailId = req.params.detail;
        const status = req.body.status;

        const detail = order.details.find(v => v.id === detailId)
        if (detail.status === 'Cancelled') {
            return res.sendError("You cannot perform this action. Order Cancelled.");
        }

        const vertices = []
        const edges = []

        if (status === 'Cancelled') {
            const data = order.details.filter(v => v.status !== 'Cancelled' && v.id !== detailId).reduce((acc, v) => {
                acc.discount += v.amountDiscount
                acc.amount += v.amountItem
            }, {discount: 0, amount: 0})

            const orderUp = {}
            orderUp.amountItems = data['amount'];
            orderUp.amountDiscount = data['discount'];

            const orderValue = (order.amountItems - order.amountDiscount);

            // Coupon
            const coupon = order.coupon;
            if (coupon) {
                if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
                    // Remove Coupon
                    await tgDeleteEdge(Schema.SalesOrder.edges.ORDER_HAS_COUPON, order.id, order._couponId)
                } else {
                    let discountAmount;
                    if (coupon.discountType === 'Amount') {
                        discountAmount = coupon.discountValue;
                    } else {
                        discountAmount = orderValue * (coupon.discountValue / 100);

                        if (coupon.maxDiscountValue) {
                            discountAmount = Math.min(discountAmount, coupon.maxDiscountValue);
                        }
                    }

                    orderUp.amountPromotion = discountAmount;
                }
            }

            orderUp.amountTotal = orderValue + order.amountDelivery - order.amountPromotion;
            orderUp.amountBalance = order.amountTotal - (order.amountPaid - order.amountRefunded)

            vertices.push(
                createVertexQuery(Schema.SalesOrder, order.id, orderUp)
            )

            // Update Stock & Purchase Count
            const itemUp = {}
            if (detail.item.maintainStock) {
                itemUp.stock = detail.item.stock + detail.qty
            }
            itemUp.purchaseCount = detail.item.purchaseCount -= detail.qty

            vertices.push(
                createVertexQuery(Schema.Item, detail.item.id, itemUp)
            )
        }

        vertices.push(
            createVertexQuery(Schema.OrderDetail, detail.id, {status})
        )

        await tgUpsert(vertices, edges)
    } catch (e) {
        console.log(e)
        return res.sendError()
    }

    return res.sendSuccess(null);
}

async function patchPayment(req, res) {
    const id = req.params.id
    const order = await tgExecuteFindOne({filter: {_id: id}, include: 'assignedTo'}, Schema.SalesOrder.name)

    const joiSchema = Joi.object({
        type: Joi.string().required().valid('Credit', 'Debit'),
        method: Joi.string().required().valid('Cash', 'UPI', 'RazorPay'),
        amount: Joi.number().required()
    }).options({stripUnknown: true})

    const {error, value} = joiSchema.validate(req.body)
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    const type = value.type
    const method = value.method
    const amount = value.amount

    if (order.amountBalance === 0 ||
        (order.amountBalance > 0 && type === 'Debit') ||
        (order.amountBalance < 0 && type === 'Credit'))
    {
        return res.sendError("Invalid type");
    }

    const up = {}
    if (type === 'Credit') {
        up.amountPaid = order.amountPaid + amount
        up.amountBalance = order.amountBalance - amount
    } else {
        up.amountRefunded = order.amountRefunded + amount
        up.amountBalance = order.amountBalance + amount

        if (order.razorpayPaymentId) {
            await refund(order, amount)
        }
    }

    const pl = {
        type,
        method,
        amount,
        fee: 0,
        createdAt: new Date().toISOString(),
        _createdBy: req.userId
    }
    const pid = createUID()

    const vertices = [
        createVertexQuery(Schema.SalesOrder, id, up),
        createVertexQuery(Schema.PaymentLog, pid, pl)
    ]
    const edges = [
        createEdgeQuery(Schema.SalesOrder.edges.ORDER_HAS_PAYMENT_LOG, order.id, pid),
        createEdgeQuery(Schema.PaymentLog.edges.PAYMENT_LOG_CREATED_BY, pid, req.userId)
    ]

    await tgUpsert(vertices, edges)

    return res.sendSuccess();
}

async function refund(order, amount) {
    const api = new Razorpay({
        key_id: process.env.RAZOR_PAY_ID,
        key_secret: process.env.RAZOR_PAY_SECRET,
    })

    await api.payments.refund(order.razorpayPaymentId,{
        "amount": Math.round(amount * 100),
        "speed": "normal",
        "receipt": '#' . order.id
    })
}

async function cancelOrder(orderHelper) {
    const order = orderHelper.order
    if (!orderHelper.canI(OrderHelper.PERMISSION_STATUS_CANCELLED)) {
        throw new Error("Order cannot be cancelled. Order has been " + order.status);
    }

    const vertexes = []

    // Update Stock & Purchase count
    for (const detail of order.details) {
        if (detail.item.maintainStock) {
            vertexes.push(
                createVertexQuery(Schema.Item, detail.item.id, {stock: detail.item.stock + detail.qty})
            )
        }
    }

    // Update Customer Stat
    vertexes.push(
        createVertexQuery(Schema.Customer, order.customer.id, {
            statTotalOrdersCancelled: order.customer.statTotalOrdersCancelled + 1
        })
    )

    // Update Coupon
    await tgDeleteEdge(Schema.SalesOrder.edges.ORDER_HAS_COUPON, order.id, order._couponId)

    vertexes.push(
        createVertexQuery(Schema.SalesOrder, order.id, {
            status: OrderHelper.STATUS_CANCELLED,
            amountBalance: -(order.amountPaid - order.amountRefunded),
            statusChangedAt: new Date().toISOString(),
            _couponId: ''
        })
    )

    await tgUpsert(vertexes)
}

async function deliverOrder(orderHelper) {
    const order = orderHelper.order
    const vertexes = []

    // Update Purchase Count
    for (const detail of order.details) {
        vertexes.push(
            createVertexQuery(Schema.Item, detail.item.id, {purchaseCount: detail.item.purchaseCount + detail.qty})
        )
    }

    // Update Customer Stat
    vertexes.push(
        createVertexQuery(Schema.Customer, order.customer.id, {
            statTotalOrders: order.customer.statTotalOrders + 1,
            statTotalOrderAmount: order.customer.statTotalOrderAmount + order.amountTotal
        })
    )

    vertexes.push(
        createVertexQuery(Schema.SalesOrder, order.id, {status: OrderHelper.STATUS_DELIVERED, statusChangedAt: new Date().toISOString(),})
    )

    await tgUpsert(vertexes)
}

async function updateStatus(req, res) {
    const id = req.params.id
    const status = req.body['status']

    try {
        const order = await tgExecuteFindOne({
            filter: {_id: id},
            include: 'assignedTo;details;details.item;customer'
        }, Schema.SalesOrder.name)
        const orderHelper = new OrderHelper(order, req.user)

        if (!orderHelper.canIEdit()) {
            return res.sendError("You cannot perform this action. No Permission.");
        }

        const pMap = {
            [OrderHelper.STATUS_PROCESSING]: OrderHelper.PERMISSION_STATUS_PROCESSING,
            [OrderHelper.STATUS_PROCESSED]: OrderHelper.PERMISSION_STATUS_PROCESSED,
            [OrderHelper.STATUS_DISPATCHED]: OrderHelper.PERMISSION_STATUS_DISPATCHED,
            [OrderHelper.STATUS_DELIVERED]: OrderHelper.PERMISSION_STATUS_DELIVERED,
            [OrderHelper.STATUS_CANCELLED]: OrderHelper.PERMISSION_STATUS_CANCELLED
        };

        const permission = pMap[status] ?? null;
        if (!permission) {
            return res.sendError("Invalid Status");
        }

        if (!orderHelper.canI(permission)) {
            return res.sendError("Permission Denied");
        }

        if (status === OrderHelper.STATUS_DELIVERED) {
            await deliverOrder(orderHelper);
        } else if (status === OrderHelper.STATUS_CANCELLED) {
            await cancelOrder(orderHelper);
        } else {
            await tgUpsert(createVertexQuery(Schema.SalesOrder, order.id, {status}))
        }
    } catch (e) {
        console.log(e)
        return res.sendError()
    }

    return res.sendSuccess()
}

async function assignOrder(req, res) {
    const id = req.params.id
    let user = req.params.user

    let permission = OrderHelper.PERMISSION_ASSIGN_USER;
    if (user === 'me') {
        permission = OrderHelper.PERMISSION_ACCEPT_ORDER;
        user = req.userId;
    }

    try {
        const order = await tgExecuteFindOne({filter: {_id: id}, include: 'assignedTo'}, Schema.SalesOrder.name)
        const orderHelper = new OrderHelper(order, req.user)

        if (!orderHelper.canI(permission)) {
            return res.sendError("Permission Denied");
        }

        await tgUpsert(
            createVertexQuery(Schema.SalesOrder, id, {_assignedTo: user}),
            createEdgeQuery(Schema.SalesOrder.edges.ORDER_ASSIGNED_TO, id, user)
        )
    } catch (e) {
        console.log(e)
        return res.sendError()
    }

    return res.sendSuccess()
}

async function removedAssignedUser(req, res) {
    const id = req.params.id
    try {
        const order = await tgExecuteFindOne({filter: {_id: id}, include: 'assignedTo'}, Schema.SalesOrder.name)
        const orderHelper = new OrderHelper(order, req.user)

        if (!orderHelper.canI(OrderHelper.PERMISSION_REMOVE_USER)) {
            return res.sendError("You don't have privilege to un assign order");
        }

        await tgUpsert(createVertexQuery(Schema.SalesOrder, id, {_assignedTo: ''}))
        await tgDeleteEdge(Schema.SalesOrder.edges.ORDER_ASSIGNED_TO, id, order._assignedTo)
    } catch (e) {
        return res.sendError("Error")
    }

    return res.sendSuccess()
}

module.exports = {
    patchItemStatus,
    patchPayment,
    updateStatus,
    assignOrder,
    removedAssignedUser,
}
