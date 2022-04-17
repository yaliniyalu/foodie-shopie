require('dotenv').config();
const dayjs = require("dayjs");
const api = require("./api");

const body = {
    type: "customer",
    where: {
        from: "2022-02-01",
        to: "2022-03-01",
        item: "",
        category: "",
        location: "",
        customer: ""
    },
    fields: ['name', "customerType", "phone"],
    orderBy: ["totalCount", "desc"],
    filter: {
        name: {op: 'LIKE', value: "A%"}
    },
    limit: null,
    offset: null,
    into: null
}

const query = []
query.push('INTERPRET QUERY () FOR GRAPH ' + process.env.TG_GRAPH_NAME + " {")

if (!body.where.from) {
    body.where.from = dayjs().year(1500).format()
}

if (!body.where.to) {
    body.where.to = dayjs().year(2500).format()
}

const alias = body.type
const getTyped = (val) => typeof val === "string" ? `"${val}"` : val

const selectFields = ['count(sales_order) as totalCount', 'sum(order_detail.amount) as totalAmount', 'sum(order_detail.amountDiscount) as totalDiscount']
for (const field of body.fields) {
    selectFields.unshift(alias + '.' + field)
}

const filterFields = [`sales_order.createdAt >= ${getTyped(body.where.from)}`, `sales_order.createdAt <= ${getTyped(body.where.to)}`];
for (const [field, value] of Object.entries(body.filter)) {
    filterFields.push(`${alias}.${field} ${value.op ?? '=='} ${getTyped(value.value)}`)
}

if (!body.orderBy?.length) {
    body.orderBy = ['totalCount', 'DESC']
} else {
    if (!['totalCount', 'totalAmount', 'totalDiscount'].includes(body.orderBy[0])) {
        body.orderBy[0] = `${alias}.${body.orderBy[0]}`
    }
}

if (!body.limit) {
    body.limit = 50
}

if (!body.offset) {
    body.offset = 0
}

if (body.where.item) {
    body.where.category = undefined
}

for (const [field, value] of Object.entries(body.where)) {
    if (value && !['from', 'to'].includes(field)) {
        filterFields.unshift(`${field}.id == ${getTyped(value)}`)
    }
}

const selectQuery = `SELECT ${selectFields.join(', ')} 
INTO AnalCustomers 
FROM SalesOrder:sales_order -(ORDER_PLACED_BY)- :customer -(ORDER_PLACED_BY)- :o2 -(ORDER_HAS_DELIVERY_ADDRESS)- :address -(ADDRESS_HAS_LOCATION)- :location -(ADDRESS_HAS_LOCATION)- :a2 -(ORDER_HAS_DELIVERY_ADDRESS)- :o3 -(ORDER_HAS_DETAIL)- OrderDetail:order_detail -(ORDER_DETAIL_HAS_ITEM)- Item:item -(ITEM_IN_CATEGORY)- Category:category
WHERE ${filterFields.join(' AND ')}
GROUP BY ${alias}.id
ORDER BY ${body.orderBy[0]} ${body.orderBy[1]}
LIMIT ${body.limit}
OFFSET ${body.offset};
`

query.push(selectQuery)
query.push('PRINT AnalCustomers;')

query.push("}")

api.post('https://shopy-yalusoft.i.tgcloud.io:14240/gsqlserver/interpreted_query', query.join("\n"), {
    headers: {
        'Content-Type': 'text/plain',
    },
    auth: {
        username: process.env.TG_USERNAME,
        password: process.env.TG_PASSWORD
    }
}).then(v => {
    console.log(v.data)
})
    .catch(e => console.log(e.response.data))

console.log(query.join("\n"))
