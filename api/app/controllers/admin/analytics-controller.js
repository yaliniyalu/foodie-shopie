const dayjs = require("dayjs");
const api = require("../../../api");

async function getAnalytics(req, res) {
    const where = req.body.where
    const query = [];
    const query1 = `
            SumAccum<INT> @@totalCount = 0;
  SumAccum<INT> @@totalCouponClaimCount = 0;
  SumAccum<INT> @@totalCancelledCount = 0;
  
  SumAccum<FLOAT> @@totalAmount = 0;
  SumAccum<FLOAT> @@totalDiscount = 0;
  SumAccum<FLOAT> @@totalCouponAmount = 0;
  
  AvgAccum @@averageAmount;
  AvgAccum @@averageDiscount;
  AvgAccum @@averageCouponAmount;
  
  MinAccum<FLOAT> @@minAmount = 0;
  MinAccum<FLOAT> @@minDiscount = 0;
  MinAccum<FLOAT> @@minCouponAmount = 0;
  
  MaxAccum<FLOAT> @@maxAmount = 0;
  MaxAccum<FLOAT> @@maxDiscount = 0;
  MaxAccum<FLOAT> @@maxCouponAmount = 0;
  
  SO = {SalesOrder.*};
  
  Orders = SELECT sales_order
  FROM SO:sales_order -(ORDER_PLACED_BY)- :customer -(ORDER_PLACED_BY)- :o2 -(ORDER_HAS_DELIVERY_ADDRESS)- :address -(ADDRESS_HAS_LOCATION)- :location -(ADDRESS_HAS_LOCATION)- :a2 -(ORDER_HAS_DELIVERY_ADDRESS)- :o3 -(ORDER_HAS_DETAIL)- OrderDetail:order_detail -(ORDER_DETAIL_HAS_ITEM)- Item:item -(ITEM_IN_CATEGORY)- Category:category
  WHERE ${buildFilterQuery(where)}
  POST-ACCUM 
  IF (sales_order.status == "Cancelled") THEN 
    @@totalCancelledCount += 1
  ELSE IF (sales_order.status == "Delivered") THEN
    @@totalCount += 1, 
    @@totalAmount += sales_order.amountTotal,
    @@totalDiscount += sales_order.amountDiscount,
    @@averageAmount += sales_order.amountTotal,
    @@averageDiscount += sales_order.amountDiscount,
    @@minAmount += sales_order.amountTotal,
    @@minDiscount += sales_order.amountDiscount,
    @@maxAmount += sales_order.amountTotal,
    @@maxDiscount += sales_order.amountDiscount,
    IF (sales_order.amountPromotion > 0) THEN 
      @@totalCouponClaimCount += 1,
      @@averageCouponAmount += 1,
      @@maxCouponAmount += sales_order.amountPromotion,
      @@totalCouponAmount += sales_order.amountPromotion,
      @@minCouponAmount += sales_order.amountPromotion
    END
  END
  ;
  
  SumAccum<INT> @@newCustomers;
  SumAccum<INT> @@newMessages;

  NewCustomers = SELECT c FROM Customer:c WHERE ${buildFilterTimeQuery({from: where.from, to: where.to}, 'c').join(' AND ')} ACCUM @@newCustomers += 1;
  NewMessages = SELECT c FROM CustomerMessage:c WHERE ${buildFilterTimeQuery({from: where.from, to: where.to}, 'c').join(' AND ')} ACCUM @@newMessages += 1;
  
  PRINT @@totalCount,
  @@totalCouponClaimCount,
  @@totalAmount,
  @@totalDiscount,
  @@totalCouponAmount,
  @@averageAmount,
  @@averageDiscount,
  @@averageCouponAmount,
  @@minAmount,
  @@minDiscount,
  @@minCouponAmount,
  @@maxAmount,
  @@maxDiscount,
  @@maxCouponAmount,
  @@newCustomers,
  @@newMessages,
  @@totalCancelledCount
  ;
    `

    query.push(query1)

    try {
        const data = await evaluate(query.join("\n"))
        res.sendSuccess(data)
    } catch (e) {
        console.log(query.join("\n"))
        console.error(e)
        res.sendError()
    }
}

async function getAnalyticsTable(req, res) {
    try {
        const data = await evaluate(buildTableQuery(req.body))
        res.sendSuccess(data)
    } catch (e) {
        console.log(e)
        res.sendError()
    }
}

async function evaluate(query) {
    query = [`INTERPRET QUERY () FOR GRAPH ${process.env.TG_GRAPH_NAME} {`, query, '}'].join("\n")
    try {
        const response = await api.post(process.env.TG_GSQL_SERVER + '/gsqlserver/interpreted_query', query, {
            headers: {
                'Content-Type': 'text/plain',
            },
            auth: {
                username: process.env.TG_USERNAME,
                password: process.env.TG_PASSWORD
            }
        })
        if (response.data.error) {
            return Promise.reject(response?.data)
        } else {
            return response.data.results
        }
    } catch (e) {
        return Promise.reject(e.response?.data ?? {})
    }
}

const getTyped = (val) => typeof val === "string" ? `"${val}"` : val

function getFromQuery() {
    return "SalesOrder:sales_order -(ORDER_PLACED_BY)- :customer -(ORDER_PLACED_BY)- :o2 -(ORDER_HAS_DELIVERY_ADDRESS)- :address -(ADDRESS_HAS_LOCATION)- :location -(ADDRESS_HAS_LOCATION)- :a2 -(ORDER_HAS_DELIVERY_ADDRESS)- :o3 -(ORDER_HAS_DETAIL)- OrderDetail:order_detail -(ORDER_DETAIL_HAS_ITEM)- Item:item -(ITEM_IN_CATEGORY)- Category:category"
}

function buildFilterTimeQuery(where, alias) {
    if (!where.from) {
        where.from = dayjs().year(1500).format()
    } else {
        where.from = dayjs(where.from).hour(0).minute(0).second(0).format()
    }

    if (!where.to) {
        where.to = dayjs().year(2500).format()
    } else {
        where.to = dayjs(where.to).hour(0).minute(0).second(0).format()
    }

    return [`${alias}.createdAt >= ${getTyped(where.from)}`, `${alias}.createdAt <= ${getTyped(where.to)}`];
}

function buildFilterQuery(where, filter = {}, alias = null) {
    if (where.item) {
        where.category = undefined
    }

    const filterFields = buildFilterTimeQuery(where, 'sales_order');
    for (const [field, value] of Object.entries(filter)) {
        filterFields.push(`${alias}.${field} ${value.op ?? '=='} ${getTyped(value.value)}`)
    }

    for (const [field, value] of Object.entries(where)) {
        if (value && !['from', 'to'].includes(field)) {
            filterFields.unshift(`${field}.id == ${getTyped(value)}`)
        }
    }

    return filterFields.join(' AND ')
}

const defaultFields = {
    customer: ['name', "customerType", "phone"],
    item: ['code', "name", "price"],
    location: ['name', "pincode"]
}

function buildTableQuery(body) {
    if (!body.into) {
        body.into = body.type + 'Data'
    }

    const alias = body.type

    const selectFields = ['count(sales_order) as totalCount', 'sum(order_detail.amount) as totalAmount', 'sum(order_detail.amountDiscount) as totalDiscount']
    for (const field of body.fields ?? defaultFields[alias]) {
        selectFields.unshift(alias + '.' + field)
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

    return `SELECT ${selectFields.join(', ')} 
INTO ${body.into} 
FROM ${getFromQuery()}
WHERE ${buildFilterQuery(body.where, body.filter ?? {}, alias)}
GROUP BY ${alias}.id
ORDER BY ${body.orderBy[0]} ${body.orderBy[1]}
LIMIT ${body.limit}
OFFSET ${body.offset};
PRINT ${body.into};
`
}

module.exports = {
    getAnalytics,
    getAnalyticsTable
}
