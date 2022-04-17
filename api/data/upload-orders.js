const path = require('path')
const fs = require("fs");

require('dotenv').config({path: path.resolve(__dirname , '../.env')})
const Schema = require("../app/tg-schema");
const {tgDeleteVertex, tgUpsert} = require("../app/tg-helpers");

const files = [
    'customers.json',
    'reviews.json',
    'message.json',
    'coupons.json',
    'order-address.json',
    'order-payment.json',
    'orders.json',
    'order-details.json',
    'items-update.json'
]

console.log('Started')
async function upload() {
    await clearData()

    for (const file of files) {
        await uploadFile(path.resolve(__dirname, 'json', file))
    }
}

async function clearData() {
    await tgDeleteVertex(Schema.Address.name, '').then(r => console.log('Address Cleared'))
    await tgDeleteVertex(Schema.Customer.name, '').then(r => console.log('Customer Cleared'))
    await tgDeleteVertex(Schema.ItemReview.name, '').then(r => console.log('Item Review Cleared'))
    await tgDeleteVertex(Schema.CustomerMessage.name, '').then(r => console.log('Customer Message Cleared'))
    await tgDeleteVertex(Schema.Coupon.name, '').then(r => console.log('Coupon Cleared'))
    await tgDeleteVertex(Schema.PaymentLog.name, '').then(r => console.log('Payment Cleared'))
    await tgDeleteVertex(Schema.SalesOrder.name, '').then(r => console.log('Sales Order Cleared'))
    await tgDeleteVertex(Schema.OrderDetail.name, '').then(r => console.log('Order Details Cleared'))
}

async function uploadFile(file) {
    console.log(`[${file}] Uploading...`)
    const data = JSON.parse(fs.readFileSync(file).toString())[0]
    await tgUpsert(data.vertices, data.edges, {triggers: false})
    console.log(`[${file}] Uploaded`)
}

upload().then(r => console.log('Done')).catch(e => console.log(e))
