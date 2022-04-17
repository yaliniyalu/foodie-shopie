const Cart = require("../../helpers/cart-helper");
const Joi = require("joi");
const {tgExecuteSearch} = require("../../search-query");
const {tgUpsert, createVertexQuery, createUID, createSID, createEdgeQuery, tgDeleteVertex, tgDeleteEdge} = require("../../tg-helpers");
const Schema = require("../../tg-schema");
const Razorpay = require("razorpay");
const AppSettings = require("../../helpers/app-settings");
const {getRefundAmount} = require("../../helpers/item-helper");
const lockfile = require('proper-lockfile');
const fs = require("fs/promises");

async function summary(req, res) {
    const items = req.body['items']
    const coupon = req.body['coupon']
    const pincode = req.body['pincode']

    if (!pincode) {
        return res.sendError("Pincode is required");
    }

    try {
        const cart = new Cart(req.user, items, pincode, coupon);
        res.sendSuccess({
            items: await cart.getItems(),
            locationDetails: await cart.getDeliveryLocation(),
            couponDetails: await cart.getCouponDetails(),
            pricingDetails: await cart.getPricingDetails()
        })
    } catch (e) {
        return res.sendError("Unknown error");
    }
}

async function create(req, res) {
    try {
        const customer = req.user

        const joiSchema = Joi.object({
            paymentMethod: Joi.string().required().valid('card', 'cash', 'upi', 'netbanking'),
            items: Joi.array().items(Joi.string()).required().min(1),
            couponCode: Joi.string().optional().allow('', null),
            deliveryAddress: Joi.object().keys({
                id: Joi.string().optional().allow('', null),
                name: Joi.string().required(),
                phone: Joi.string().required(),
                address1: Joi.string().required(),
                street: Joi.string().required(),
                city: Joi.string().required(),
                pincode: Joi.string().required(),
                locationId: Joi.string().required(),

                address2: Joi.optional().allow('', null),
                landmark: Joi.optional().allow('', null)
            })
        }).options({stripUnknown: true})

        const {error, value} = joiSchema.validate(req.body);
        if (error) {
            return res.sendError("Invalid Data", error)
        }

        const itemIds = value.items;
        const address = value.deliveryAddress;
        const paymentMethod = value.paymentMethod;
        const paymentType = paymentMethod === 'cash' ? 'Cash' : 'RazorPay';
        const couponCode = value.couponCode;

        const locationId = address.locationId

        await lockfile.lock(process.env.LOCAL_DIR + '/orders.lock')

        let __oid = await fs.readFile(process.env.LOCAL_DIR + '/order-id.txt')
        __oid = parseInt(__oid.toString()) + 1

        const orderId = __oid.toString().padStart(6, '0');
        const addressId = createSID(Schema.SalesOrder.name, Schema.Address.name, orderId)

        /* Customer Address */ {
            const addressId = address.id ? address.id : createUID()
            const customerAddress = {...address, _customerId: req.userId, _id: addressId}
            const vertex = createVertexQuery(Schema.Address, addressId, customerAddress)
            const edge = [
                createEdgeQuery(Schema.Address.edges.ADDRESS_HAS_LOCATION, addressId, locationId),
                createEdgeQuery(Schema.Customer.edges.CUSTOMER_HAS_ADDRESS, req.userId, addressId)
            ]
            await tgUpsert(vertex, edge)
        }

        const cart = new Cart(customer, itemIds, address['pincode'], couponCode)

        const items = await cart.getItems();
        const pricing = await cart.getPricingDetails();
        const deliveryDetails = await cart.getDeliveryLocation();
        const couponDetails = await cart.getCouponDetails();

        if (!items.length) {
            return res.sendError('Please add items in cart');
        }

        if (!deliveryDetails || !deliveryDetails['isDeliverable']) {
            return res.sendError('Pincode selected is not deliverable');
        }

        if (couponDetails && couponDetails['status'] !== 'APPLIED') {
            return res.sendError('Coupon error: ' + couponDetails['message']);
        }

        for (const item of items) {
            if (item['item']['canPurchase'] && (item['item']['stock'] === -1 || item['qty'] <= item['item']['stock'])) {

            } else {
                return res.sendError('Some items are out of stock');
            }
        }

        const result = {}

        const vertexes = []
        const edges = []

        /* Order Address */ {
            const orderAddress = {...address, _id: addressId, id: addressId}
            vertexes.push(createVertexQuery(Schema.Address, addressId, orderAddress))
            edges.push(
                createEdgeQuery(Schema.Address.edges.ADDRESS_HAS_LOCATION, addressId, locationId)
            )
        }

        const order = {
            id: orderId,
            _id: orderId,
            _customerId: customer.id,
            _addressId: addressId,
            _assignedTo: '',
            _locationId: locationId,
            _couponId: couponDetails?.coupon?.id ?? '',
            paymentType,
            amountItems: pricing.subTotal,
            amountDiscount: pricing.totalDiscount,
            amountDelivery: pricing.deliveryCharge,
            amountPromotion: pricing.couponDiscount,
            amountTotal: pricing.grandTotal,
            amountPaid: 0,
            amountRefunded: 0,
            amountBalance: pricing.grandTotal,
            itemsCount: items.length,
            status: paymentType === 'RazorPay' ? 'Waiting' : 'Pending',
            paymentStatus: 'Pending',
            statusChangedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        result['order'] = order

        // Generate Payment Request
        if (paymentType === 'RazorPay') {
            const payment = {
                order_id: orderId,
                description: items.map(v => v.item.name).join(', '),
                amount: pricing.grandTotal,
            }

            const paymentRequest = await generatePaymentRequest(payment, customer);
            order.razorpayOrderId = paymentRequest['order_id']

            result['paymentRequest'] = paymentRequest;
        }

        /* Order */ {
            vertexes.push(createVertexQuery(Schema.SalesOrder, orderId, order))
            edges.push(
                createEdgeQuery(Schema.SalesOrder.edges.ORDER_HAS_DELIVERY_ADDRESS, orderId, addressId),
                createEdgeQuery(Schema.SalesOrder.edges.ORDER_PLACED_BY, orderId, customer.id)
            )
        }

        for (const cartItem of items) {
            const item = cartItem.item;
            const detail = {
                _id: createUID(),
                _orderId: orderId,
                _itemId:      item.id,
                itemName:     item.name,
                qty:          cartItem.qty,
                price:        item.price.price,
                discount:     item.price.discountAmount + 0,
                amount:       cartItem.totalAmount, // qty * price
                sellingPrice:   item.price.oldPrice,
                amountItem:     cartItem.qty * item.price.oldPrice,  // qty * selling_price
                amountDiscount: cartItem.qty * (item.price.discountAmount + 0),  // qty * discount
                discountStr:    item.price.discountStr ?? '',
                status: 'Pending'
            }

            vertexes.push(createVertexQuery(Schema.OrderDetail, detail._id, detail))
            edges.push(
                createEdgeQuery(Schema.OrderDetail.edges.ORDER_DETAIL_HAS_ITEM, detail._id, detail._itemId),
                createEdgeQuery(Schema.SalesOrder.edges.ORDER_HAS_DETAIL, orderId, detail._id)
            )
        }

        // Coupon Details
        if (couponDetails && couponDetails['status'] === 'APPLIED') {
            edges.push(createEdgeQuery(Schema.SalesOrder.edges.ORDER_HAS_COUPON, orderId, couponDetails.coupon.id, {
                _orderId: orderId,
                _customerId: customer.id,
                _couponId: couponDetails.coupon.id,
                discount: couponDetails.coupon.discountStr
            }))
        }

        // Update Stock
        for (const cartItem of items) {
            const update = {};
            if (cartItem.item.maintainStock) {
                update['stock'] = cartItem.item.stock - cartItem.qty;
                vertexes.push(createVertexQuery(Schema.Item, cartItem.item._id, update))
            }
        }

        console.log('--UPSERT--')
        await tgUpsert(vertexes, edges)

        await fs.writeFile(process.env.LOCAL_DIR + '/order-id.txt', __oid + '')
        await lockfile.unlock(process.env.LOCAL_DIR + '/orders.lock');

        // Update Cart
        for (const item of items) {
            await tgDeleteVertex(Schema.Cart.name, item.id)
        }

        res.sendSuccess(result)
    } catch (e) {
        console.log(e)
        res.sendError(e.message)
        await lockfile.unlock(process.env.LOCAL_DIR + '/orders.lock');
    }
}

async function generatePaymentRequest(payment, customer) {
    const api = new Razorpay({
        key_id: process.env.RAZOR_PAY_ID,
        key_secret: process.env.RAZOR_PAY_SECRET,
    })

    let rpOrder = null
    if (payment['razorpayOrderId']) {
        const rp =await api.orders.fetch(payment['razorpayOrderId'])
        if (rp['receipt'] === '#' + payment['orderId']) {
            rpOrder = {
                'amount_due': Math.round(payment['amount'] * 100),
                'id': payment['razorpayOrderId'],
                'currency': 'INR'
            }
        }
    }

    if (!rpOrder) {
        rpOrder = await api.orders.create({
            'receipt': '#' + payment['orderId'],
            'amount': Math.round(payment['amount'] * 100),
            'currency': 'INR'
        })
    }

    const req = {
        key: process.env.RAZOR_PAY_ID,
        amount: rpOrder['amount_due'],
        description: payment['description'],
        order_id: rpOrder['id'],
        currency: rpOrder['currency'],
        prefill: {
            contact: customer.phone,
            email: customer.email ? customer.email : process.env.DEFAULT_CUSTOMER_EMAIL.replace('%d', customer.id),
            name: customer.name ?? null
        },
        send_sms_hash: true,
        readonly: {
            contact: true,
            email: true
        }
    }

    const settings = AppSettings.get(['razorpay.payment.name', 'razorpay.payment.color', 'razorpay.payment.logo']);

    if (settings['razorpay.payment.name'])
        req['name'] = settings['razorpay.payment.name'];

    if (settings['razorpay.payment.logo'])
        req['image'] = settings['razorpay.payment.logo'];

    if (settings['razorpay.payment.color'])
        req['theme'] = {color: settings['razorpay.payment.color']}

    return req;
}

async function updatePayment(req, res) {
    const joiSchema = Joi.object({
        status: Joi.string().required().valid('success', 'failure'),
        razorpay_order_id: Joi.string().required(),
        razorpay_payment_id: Joi.string().allow('', null).when('status', {is: 'success', then: Joi.required()}),
        razorpay_signature: Joi.string().allow('', null).when('status', {is: 'success', then: Joi.required()}),
    }).options({stripUnknown: true})

    const {error, value} = joiSchema.validate(req.body);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    if (value.status !== 'success') {
        return res.sendSuccess()
    }

    try {
        const {validatePaymentVerification} = require('razorpay/dist/utils/razorpay-utils');
        validatePaymentVerification({
            order_id: value.razorpay_order_id,
            payment_id: value.razorpay_payment_id
        }, value.razorpay_signature, process.env.RAZOR_PAY_SECRET)

        let order = await tgExecuteSearch({filter: {razorpayOrderId: value.razorpay_order_id}}, Schema.SalesOrder.name)
        if (!order.length) {
            return res.sendError("Order not found")
        }
        order = order[0]

        const up = {
            razorpayPaymentId: value.razorpay_payment_id,
            razorpaySignature: value.razorpay_signature,
            amountPaid: order.amountBalance,
            paymentStatus: 'Paid',
            paymentType: 'RazorPay',
            amountBalance: order.amountTotal - (order.amountBalance - order.amountRefunded),
            status: order.status === 'Waiting' ? 'Pending' : order.status,
        }

        const pl = {
            type: 'Credit',
            method: 'RazorPay',
            amount: order.amountBalance,
            fee: 0,
            createdAt: new Date().toISOString()
        }

        const pid = createUID()

        const vertex = [
            createVertexQuery(Schema.SalesOrder, order.id, up),
            createVertexQuery(Schema.PaymentLog, pid, pl)
        ];

        const edges = [
            createEdgeQuery(Schema.SalesOrder.edges.ORDER_HAS_PAYMENT_LOG, order.id, pid)
        ]

        await tgUpsert(vertex, edges)
    } catch (e) {
        console.log(e)
        return res.sendError('Unable to update')
    }

    res.sendSuccess({})
}

async function payLater(req, res) {
    try {
        let order = await tgExecuteSearch({
            filter: {id: req.params.id},
            select: 'status,id'
        }, Schema.SalesOrder.name)

        if (!order.length) {
            return res.sendError("Order not found");
        }
        order = order[0]

        if (order.status !== 'Waiting') {
            return res.sendError("You cannot pay later");
        }

        await tgUpsert(createVertexQuery(Schema.SalesOrder, order.id, {status: 'Pending'}))

        return res.sendSuccess();
    } catch (e) {
        console.log(e)
        res.sendError("Unknown error");
    }
}

async function createPaymentRequest(req, res) {
    try {
        let order = await tgExecuteSearch({
            filter: {id: req.params.id},
            select: 'status,id,amountBalance,itemsCount,razorpayOrderId'
        }, Schema.SalesOrder.name)

        if (!order.length) {
            return res.sendError("Order not found");
        }
        order = order[0]

        if (order.amountBalance <= 0) {
            return res.sendError("Already paid");
        }

        if (order.status === 'Cancelled') {
            return res.sendError("Order is cancelled");
        }

        const payment = {
            orderId: order.id,
            description: `Order of ${order.itemsCount} items`,
            amount: order.amountBalance,
            razorpayOrderId: order.razorpayOrderId
        }

        const paymentRequest = await generatePaymentRequest(payment, req.user);

        if (paymentRequest.order_id !== order.razorpayOrderId) {
            await tgUpsert(createVertexQuery(Schema.SalesOrder, order.id, {razorpayOrderId: paymentRequest.order_id}))
        }

        return res.sendSuccess({paymentRequest: paymentRequest});
    } catch (e) {
        console.log(e)
        res.sendError("Unknown error");
    }
}

async function cancel(req, res) {
    let order = await tgExecuteSearch({
        filter: {id: req.params.id},
        include: 'details;details.item'
    }, Schema.SalesOrder.name)

    if (!order.length) {
        return res.sendError("Order not found");
    }
    order = order[0]

    try {
        await cancelOrder(order);
    } catch (e) {
        return res.sendError(e.message);
    }

    return res.sendSuccess();
}

async function cancelOrder(order) {
    if (!['Pending', 'Processing', 'Waiting'].includes(order.status)) {
        throw new Error("Order cannot be cancelled. Order has been " + order.status);
    }

    const vertices = [];
    const edges = [];

    // Update Stock
    for (const det of order.details) {
        if (det.item.maintainStock) {
            vertices.push(createVertexQuery(Schema.Item, det.item.id, {stock: det.item.stock + det.qty}))
        }
    }

    // Update Coupon
    await tgDeleteEdge(Schema.SalesOrder.edges.ORDER_HAS_COUPON, order.id, order._couponId)

    const up = {
        status: 'Cancelled',
        amountBalance: -(order.amountPaid - order.amountRefunded),
    }

    if (order.amountBalance < 0 && order.razorpayPaymentId) {
        const refund = getRefundAmount(order);

        const api = new Razorpay({
            key_id: process.env.RAZOR_PAY_ID,
            key_secret: process.env.RAZOR_PAY_SECRET,
        })

        await api.payments.refund(order.razorpayPaymentId,{
            "amount": Math.round(refund.amount * 100),
            "speed": "normal",
            "receipt": '#' . order.id
        })

        up['amountRefunded'] = refund.balance
        up['amountBalance'] = 0

        const pl = {
            type: 'Debit',
            method: 'RazorPay',
            amount: refund.amount,
            fee: 0,
            createdAt: new Date().toISOString()
        }

        const pid = createUID()
        vertices.push(createVertexQuery(Schema.PaymentLog, pid, pl));
    }

    vertices.push(createVertexQuery(Schema.SalesOrder, order.id, up))
    await tgUpsert(vertices, edges)
}

function castParams(req, res, next) {
    req.params.id = req.params.id ? req.params.id : undefined
    next()
}

module.exports = {
    summary,
    create,
    updatePayment,
    payLater,
    createPaymentRequest,
    cancel,
    castParams
}
