const fs = require("fs");
const path = require("path");
const faker = require("@faker-js/faker").faker;

require('dotenv').config({path: path.resolve(__dirname , '../.env')})
const {createUID, createSID, createVertexQuery, createEdgeQuery} = require("../app/tg-helpers");
const Schema = require("../app/tg-schema");
const {getDiscountNumber} = require("../app/helpers/item-helper");
const JSONStream = require("JSONStream");

const ADMIN_ID = 'd6e226ed-e17f-415d-a241-c18d5587e2de'


const dateFrom = new Date('2022-02-11T00:00').getTime()
const dateTo = new Date('2022-05-11T00:00').getTime()

console.log('Creating...')

function weighted_random(options) {
    var i;

    var weights = [];

    for (i = 0; i < options.length; i++)
        weights[i] = options[i].weight + (weights[i - 1] || 0);

    var random = Math.random() * weights[weights.length - 1];

    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;

    return options[i].item;
}

const messageWeights = [
    {weight: 90, item: 0},
    {weight: 30, item: 1},
    {weight: 10, item: 2},
    {weight: 5, item: 3},
    {weight: 3, item: 4},
    {weight: 1, item: 5}
]

const ratingWeights = [
    {weight: 5, item: 1},
    {weight: 10, item: 2},
    {weight: 70, item: 3},
    {weight: 80, item: 4},
    {weight: 60, item: 5}
]

const itemWeights = [
    {weight: 50, item: 1},
    {weight: 60, item: 2},
    {weight: 50, item: 3},
    {weight: 30, item: 4},
    {weight: 20, item: 5},
    {weight: 10, item: 6}
]

const itemQtyWeights = [
    {weight: 90, item: 1},
    {weight: 50, item: 2},
    {weight: 15, item: 3},
    {weight: 5, item: 4},
    {weight: 2, item: 5}
]

let cFrom = 0;
let cTo = 90;

function getCustomerWeights() {
    const val = [];
    const count = (cTo - cFrom) / 4
    let start = cFrom
    for (let item = 0; item <= 4; item ++) {
        val.push({weight: start, item})
        start += count
    }

    cFrom ++
    cTo --

    return val
}

let coupon = null

const customers = []
const coupons = []
const reviews = []
const messages = []
const orders = []

const items = JSON.parse(fs.readFileSync(__dirname + '/items.json').toString())
const locations = JSON.parse(fs.readFileSync(__dirname + '/json/locations.json').toString())
const admins = Object.keys(JSON.parse(fs.readFileSync(__dirname + '/json/accounts.json').toString()).vertexes[0].User)

const mobiles = []

items.forEach(v => {
    v._id = v.id
    v.rating = 0
    v.ratingCount = 0
    v.reviewCount = 0
    v.purchaseCount = 0
    v.rr = {
        r1: 0, r2: 0, r3: 0, r4: 0, r5: 0
    }
})

let _orderId = 0;
let days = 0;
for (let date = dateFrom; date <= dateTo; date = date + 86400000) {
    days ++;
    const today = new Date(date)
    const todayCustomer = [];
    const todayItem = [];

    if (coupon && new Date(coupon.expiresOn) < today) {
        coupon = null
    }

    // CREATE CUSTOMERS
    const createCustomerCount = weighted_random(getCustomerWeights())
    for (let i = 0; i < createCustomerCount; i++) {
        customers.push(createCustomer(today))
    }

    // CREATE COUPON
    const isCreateCoupon = coupon ? false : (faker.datatype.number({min: 0, max: 100}) > 50)
    if (isCreateCoupon) {
        const c = createCoupon(today)
        coupons.push(c)
        coupon = c
    }

    // CREATE ORDER
    const createOrdersCount = Math.max(1, Math.round((customers.length * faker.datatype.number({min: 0, max: 5})) / 100))
    for (let i = 0; i < createOrdersCount; i++) {
        _orderId ++;

        const orderId = _orderId.toString().padStart(6, '0')
        const addressId = createSID(Schema.SalesOrder.name, Schema.Address.name, orderId)

        const assigned = randFromArr(admins)
        const customer = randFromArr(customers)
        const orderItems = getRandomElems(items, weighted_random(itemWeights))
        let applyCoupon = coupon ? faker.datatype.number({min: 0, max: 100}) > 50 : false
        const isCancelled = faker.datatype.number({min: 0, max: 100}) > 98
        const status = isCancelled ? 'Cancelled' : (today > new Date() ? 'Pending' : 'Delivered')
        const isFinished = status === 'Delivered'

        todayCustomer.push(customer)

        const orderDetails = []
        const pricing = {
            subTotal: 0,
            totalDiscount: 0,
            deliveryCharge: 50,
            couponDiscount: 0,
            grandTotal: 0,
        }

        let realTotal = 0;
        for (const item of orderItems) {
            const qty = weighted_random(itemQtyWeights)
            const price = calcDiscount(item, customer.customerType)

            orderDetails.push({
                _id: createUID(),
                _orderId: orderId,
                _itemId:      item.id,
                itemName:     item.name,
                qty:          qty,
                price:        price.price,
                discount:     price.discountAmount,
                amount:       qty * price.price,
                sellingPrice:   price.oldPrice,
                amountItem:     qty * price.oldPrice,
                amountDiscount: qty * price.discountAmount,
                discountStr:    price.discountStr ?? '',
                status: !isFinished ? 'Pending': 'Processed'
            })

            realTotal += (qty * price.price)
            pricing.subTotal += qty * price.oldPrice
            pricing.totalDiscount += qty * price.discountAmount

            todayItem.push({item, customer})

            if (isFinished) {
                item.purchaseCount += qty
            }
        }

        if (applyCoupon && coupon.minOrderValue && realTotal < coupon.minOrderValue) {
            applyCoupon = false
        }

        if (applyCoupon) {
            pricing.couponDiscount = realTotal * (coupon.discountValue / 100)
            pricing.couponDiscount = Math.min(pricing.couponDiscount, coupon.maxDiscountValue)
        }

        pricing.grandTotal = (realTotal - pricing.couponDiscount) + pricing.deliveryCharge;

        const orderAddress = {...customer.__address, _id: addressId}
        delete orderAddress._customerId

        const paymentLog = {
            _id: createUID(),
            type: 'Credit',
            method: 'RazorPay',
            amount: pricing.grandTotal,
            fee: 0,
            createdAt: getDateTime(today).toISOString()
        }

        const order = {
            _id: orderId,
            _customerId: customer._id,
            _addressId: addressId,
            _assignedTo: assigned,
            _locationId: orderAddress.locationId,
            _couponId: (applyCoupon && coupon) ? coupon._id : '',
            paymentType: 'Cash',
            amountItems: pricing.subTotal,
            amountDiscount: pricing.totalDiscount,
            amountDelivery: pricing.deliveryCharge,
            amountPromotion: pricing.couponDiscount,
            amountTotal: pricing.grandTotal,
            amountPaid: !isFinished ? 0 : pricing.grandTotal,
            amountRefunded: 0,
            amountBalance: 0,
            itemsCount: orderItems.length,
            status: status,
            paymentStatus: 'Paid',
            statusChangedAt: getDateTime(today).toISOString(),
            createdAt: getDateTime(today).toISOString(),

            __details: orderDetails,
            __address: orderAddress,
            __customer: customer,
            __items: orderItems,
            __coupon: applyCoupon ? coupon : null,
            __assigned: assigned,
            __paymentLog: !isFinished ? null : paymentLog
        };

        orders.push(order)

        if (isCancelled) {
            customer.statTotalOrdersCancelled ++
        } else if (isFinished) {
            customer.statTotalOrders ++
            customer.statTotalOrderAmount += realTotal
        }
    }

    const createReviewCount = weighted_random(messageWeights)
    const createMessageCount = Math.round((createOrdersCount * faker.datatype.number({min: 0, max: 10})) / 100)

    for (let i = 0; i < createMessageCount; i++) {
        messages.push(createMessage(today, randFromArr(todayCustomer)))
    }

    for (let i = 0; i < createReviewCount; i++) {
        const item = randFromArr(todayItem)
        const review = createReview(today, item.customer, item.item)
        reviews.push(review)

        item.customer.statTotalReviews++

        item.item.rr['r' + review.rating]++
        item.item.ratingCount ++

        if (review.review) {
            item.item.reviewCount ++
        }
    }
}

{ // 1.
    const vertices = []
    const edges = []

    // CUSTOMER VERTEX & EDGES
    for (const customer of customers) {
        const address = customer.__address
        delete customer.__address
        vertices.push(createVertexQuery(Schema.Customer, customer._id, customer))
        vertices.push(createVertexQuery(Schema.Address, address._id, address))
        edges.push(createEdgeQuery(Schema.Customer.edges.CUSTOMER_HAS_ADDRESS, customer._id, address._id))
        edges.push(createEdgeQuery(Schema.Address.edges.ADDRESS_HAS_LOCATION, address._id, address.locationId))
    }

    saveJson('/json/customers.json', {vertices, edges})
}

{ // 2.
    const vertices = []
    const edges = []

    // REVIEWS VERTEX & EDGES
    for (const review of reviews) {
        vertices.push(createVertexQuery(Schema.ItemReview, review._id, review))
        edges.push(createEdgeQuery(Schema.Customer.edges.CUSTOMER_WRITES_REVIEW, review._customerId, review._id))
        edges.push(createEdgeQuery(Schema.Item.edges.ITEM_HAS_REVIEW, review._itemId, review._id))
    }

    saveJson('/json/reviews.json', {vertices, edges})
}

{ // 3.
    const vertices = []
    const edges = []

    // MESSAGE VERTEX & EDGES
    for (const message of messages) {
        vertices.push(createVertexQuery(Schema.CustomerMessage, message._id, message))
        edges.push(createEdgeQuery(Schema.CustomerMessage.edges.CUSTOMER_MESSAGE_CREATED_BY, message._id, message._customerId))
    }

    saveJson('/json/message.json', {vertices, edges})
}

{ // 4.
    const vertices = []
    const edges = []

    // COUPON VERTEX & EDGES
    for (const coupon of coupons) {
        vertices.push(createVertexQuery(Schema.Coupon, coupon._id, coupon))
        edges.push(createEdgeQuery(Schema.Coupon.edges.COUPON_CREATED_BY, coupon._id, ADMIN_ID))
    }

    saveJson('/json/coupons.json', {vertices, edges})
}

{ // 5.
    const vertices = []
    const edges = []

    // ITEMS VERTEX & EDGES
    for (const item of items) {
        const r = item.rr
        const rating = ((5*r.r5)+(4*r.r4)+(3*r.r3)+(2*r.r2)+(r.r1)) / (r.r5+r.r4+r.r3+r.r2+r.r1);
        vertices.push(createVertexQuery(Schema.Item, item.id, {
            rating: isFinite(rating) && rating || 0,
            ratingCount: item.ratingCount,
            reviewCount: item.reviewCount,
            purchaseCount: item.purchaseCount
        }))
    }

    saveJson('/json/items-update.json', {vertices, edges})
}

{ // 6.
    const vertices = []
    const edges = []

    // ORDER ADDRESS VERTEX & EDGES
    for (const order of orders) {
        vertices.push(createVertexQuery(Schema.Address, order.__address._id, order.__address))
        edges.push(createEdgeQuery(Schema.Address.edges.ADDRESS_HAS_LOCATION, order.__address._id, order.__address.locationId))
    }

    saveJson('/json/order-address.json', {vertices, edges})
}

{ // 7.
    const vertices = []
    const edges = []

    // ORDER PAYMENT VERTEX & EDGES
    for (const order of orders) {
        if (order.__paymentLog) {
            const payment = {...order.__paymentLog}
            const id = payment._id
            delete payment._id
            vertices.push(createVertexQuery(Schema.PaymentLog, id, payment))
            edges.push(createEdgeQuery(Schema.PaymentLog.edges.PAYMENT_LOG_CREATED_BY, id, order._assignedTo))
        }
    }

    saveJson('/json/order-payment.json', {vertices, edges})
}

{ // 8.
    const vertices = []
    const edges = []

    // ORDERS VERTEX & EDGES
    for (const order1 of orders) {
        const order = {...order1}

        edges.push(createEdgeQuery(Schema.SalesOrder.edges.ORDER_PLACED_BY, order._id, order._customerId))
        edges.push(createEdgeQuery(Schema.SalesOrder.edges.ORDER_ASSIGNED_TO, order._id, order._assignedTo))
        edges.push(createEdgeQuery(Schema.SalesOrder.edges.ORDER_HAS_DELIVERY_ADDRESS, order._id, order.__address._id))

        if (order.__paymentLog) {
            edges.push(createEdgeQuery(Schema.SalesOrder.edges.ORDER_HAS_PAYMENT_LOG, order._id, order.__paymentLog._id))
        }

        if (order.__coupon) {
            edges.push(createEdgeQuery(Schema.SalesOrder.edges.ORDER_HAS_COUPON, order._id, order._couponId, {
                _customerId: order._customerId,
                _orderId: order._id,
                _couponId: order._couponId,
                discount: getDiscountNumber(order.__coupon.discountValue) + '%',
            }))
        }

        delete order.__details
        delete order.__address
        delete order.__customer
        delete order.__items
        delete order.__coupon
        delete order.__assigned
        delete order.__paymentLog

        vertices.push(createVertexQuery(Schema.SalesOrder, order._id, order))
    }

    saveJson('/json/orders.json', {vertices, edges})
}

{ // 9.
    const vertices = []
    const edges = []

    // ORDER DETAILS VERTEX & EDGES
    for (const order of orders) {
        for (const detail of order.__details) {
            vertices.push(createVertexQuery(Schema.OrderDetail, detail._id, detail))
            edges.push(createEdgeQuery(Schema.OrderDetail.edges.ORDER_DETAIL_HAS_ITEM, detail._id, detail._itemId))
            edges.push(createEdgeQuery(Schema.SalesOrder.edges.ORDER_HAS_DETAIL, order._id, detail._id))
        }
    }

    saveJson('/json/order-details.json', {vertices, edges})
}

function saveJson(file, data) {
    const outputStream = fs.createWriteStream( __dirname + file);
    const transformStream = JSONStream.stringify();
    transformStream.pipe(outputStream);
    transformStream.write(data)
    transformStream.end();
}

console.log('Days: ', days)
console.log('Coupons: ', coupons.length)
console.log('Reviews: ', reviews.length)
console.log('Messages: ', messages.length)
console.log('Customers: ', customers.length)
console.log('Orders: ', orders.length)

function getDateTime(date) {
    const d = new Date(date)
    d.setHours(faker.datatype.number({min: 0, max: 23}), faker.datatype.number({min: 0, max: 59}))
    return d
}

function getCustomerType() {
    const nu = faker.datatype.number({min: 0, max: 100})
    if (nu > 80) {
        return 'Prime'
    }
    return 'Normal'
}

function getUniqueMobile() {
    while (true) {
        const mobile = faker.phone.phoneNumber('9#########')
        if (mobiles.includes(mobile)) {
            continue
        }

        mobiles.push(mobile)
        return mobile
    }
}

function createCustomer(today) {
    const f_name = faker.name.firstName()
    const l_name = faker.name.lastName()
    const name = faker.name.findName(f_name, l_name)
    const email = faker.internet.email(f_name, l_name)
    const phone = getUniqueMobile()
    const address = getAddress()
    const createdAt = getDateTime(today).toISOString()

    const cid = createUID()

    return {
        _id: cid,
        name,
        customerType: getCustomerType(),
        email,
        phone,
        image: '',
        isActive: true,
        createdAt,
        statTotalOrders: 0,
        statTotalOrderAmount: 0,
        statTotalReviews: 0,
        statTotalReviewsCancelled: 0,
        statTotalOrdersCancelled: 0,
        __address: {
            _id: createUID(),
            _customerId: cid,
            name,
            phone,
            email,
            createdAt,
            ...address
        }
    }
}

function getAddress() {
    const location = randFromArr(locations);
    return {
        street: faker.address.streetName(),
        address1: faker.address.secondaryAddress(),
        address2: faker.address.cityName(),
        landmark: '',
        city: location.name,
        district: 'Kanniyakumari',
        state: 'Tamil Nadu',
        country: 'India',
        pincode: location.pincode,
        locationId: location._id,
    }
}

function createCoupon(today) {
    const validity = new Date(today)
    validity.setDate(validity.getDate() + rand(15, 30, 5))

    return {
        _id: createUID(),
        code: faker.random.alpha({ count: 5, upcase: true}),
        customerType: '',
        discountType: 'Percent',
        discountValue: rand(1, 6),
        maxDiscountValue: 200,
        minOrderValue: rand(0, 100, 15),
        usageLimit: rand(0, 1),
        expiresOn: validity,
        isActive: true
    }
}

function createMessage(today, customer) {
    return {
        _id: createUID(),
        message: faker.lorem.sentences(),
        name: customer.name,
        phone: customer.phone,
        status: 'Resolved',
        createdAt: getDateTime(today).toISOString(),
        _customerId: customer._id
    }
}

function createReview(today, customer, item) {
    const iid = createSID(Schema.ItemReview.name, item.id, customer._id)
    return {
        _id: iid,
        _customerId: customer._id,
        _itemId: item.id,
        review: faker.datatype.number({min: 0, max: 100}) > 65 ? faker.lorem.sentences() : '',
        rating: weighted_random(ratingWeights),
        status: 'Approved',
        createdAt: getDateTime(today).toISOString()
    }
}

function rand(min, max, precision = 1) {
    return faker.datatype.number({min, max, precision})
}

function randFromArr(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElems(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function calcDiscount(item, type) {
    const price = {
        price: item.price,
        oldPrice: item.price,
        discountStr: null,
        discountAmount: 0
    }

    let discount = item.discountNormal

    if (type === 'Prime') {
        discount = item.discountPrime
    }

    if (discount) {
        price['oldPrice'] = price['price']

        const dvStr = getDiscountNumber(discount);
        price['discountAmount'] = item['price'] * (discount / 100);
        price['discountStr'] = `${dvStr}%`;
        price['price'] = price['oldPrice'] - price['discountAmount'];
    }

    return price
}
