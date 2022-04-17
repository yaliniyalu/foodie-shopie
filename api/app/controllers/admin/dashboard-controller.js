const api = require("../../../api");
const dayjs = require("dayjs");
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
const advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)
dayjs.extend(isSameOrBefore)

async function getNotification(req, res) {
    try {
        const data = (await api.get(`${process.env.TG_GSQL_SERVER}/restpp/query/${process.env.TG_GRAPH_NAME}/getNotification`)).data.results

        const results = {}
        data.forEach(v => results[Object.keys(v)[0]] = Object.values(v)[0].total)

        return res.sendSuccess([
            {id: 'order_pending', count: results.OrdersPending},
            {id: 'orders_unassigned', count: results.OrdersUnassigned},
            {id: 'messages_pending', count: results.MessagesPending},
            {id: 'reviews_ending', count: results.ReviewsPending},
        ]);
    } catch (e) {
        console.log(e)
        return res.sendError()
    }
}

async function getDashboard(req, res) {
    try {
        const range = req.query['range'];
        const curr = typeToCurrInterval(range)
        const prev = typeToPrevInterval(range)

        const from = curr[0];
        const to = curr[1];

        const from2 = prev[0];
        const to2 = prev[1];

        const interval = typeToInterval(range)
        const formats = getFormatsByInterval(interval);

        const data1 = (await api.get(`${process.env.TG_GSQL_SERVER}/restpp/query/${process.env.TG_GRAPH_NAME}/getDashboard`, {
            params: {
                fromDate: from.format(),
                toDate: to.format(),
                format: formats[0]
            }
        })).data.results

        const data2 = (await api.get(`${process.env.TG_GSQL_SERVER}/restpp/query/${process.env.TG_GRAPH_NAME}/getDashboard`, {
            params: {
                fromDate: from2.format(),
                toDate: to2.format(),
                format: formats[0]
            }
        })).data.results

        const box1 = parseStatistics(data1);
        const box2 = parseStatistics(data2);

        const statistics = {
            sales: {curr: box1['sales'], prev: box2['sales']},
            orders: {curr: box1['orders'], prev: box2['orders']},
            customers: {curr: box1['customers'], prev: box2['customers']},
            sales_avg: {curr: box1['sales_avg'], prev: box2['sales_avg']}
        }

        return res.sendSuccess({
            statistics,
            graph: parseGraphs(data1, from, to, interval),
            sample: parseSamples(data1),
            data1,
            data2
        });
    } catch (e) {
        console.log(e)
        return res.sendError()
    }
}

function parseStatistics(results) {
    const v1 = results.find(v => !!v.OrderStat).OrderStat
    const v2 = results.find(v => !!v.CustomerStat).CustomerStat

    return {
        sales: v1['totalAmount'],
        orders: v1['totalCount'],
        customers: v2['totalCount'],
        sales_avg: v1['averageAmount']
    }
}

function parseSamples(results) {
    const recentReviews = results.find(v => !!v.ReviewSample).ReviewSample
    const recentCustomers = results.find(v => !!v.CustomerSample).CustomerSample
    const recentOrders = results.find(v => !!v.OrderSample).OrderSample
    const topSelling = results.find(v => !!v.TopSelling).TopSelling

    return {
        recentReviews, recentCustomers, recentOrders, topSelling
    }
}

function parseGraphs(results, from, to, interval) {
    const orderGraph = results.find(v => !!v.OrderGraph).OrderGraph
    const customerGraph = results.find(v => !!v.CustomerGraph).CustomerGraph

    return {
        orders: fixUndefinedData(orderGraph, 'totalCount', from, to, interval),
        sales: fixUndefinedData(orderGraph, 'totalAmount', from, to, interval),
        sales_avg: fixUndefinedData(orderGraph, 'averageAmount', from, to, interval),
        customers: fixUndefinedData(customerGraph, 'totalCount', from, to, interval),
    }
}

function fixUndefinedData(data, field, from, to, interval) {
    const formats = getFormatsByInterval(interval);

    const graph = [];

    let date = from
    while (true) {
        if (date.isAfter(to)) {
            break
        }

        const t = date.format(formats[1])
        let value = null

        if (date.isSameOrBefore(dayjs())) {
            value = 0

            for (const datum of data) {
                if (datum['date'] === t) {
                    value = datum[field]
                }
            }
        }

        graph.push({
            name: date.format(formats[2]),
            date: t,
            value
        })

        date = date.add(1, interval)
    }

    return graph;
}

function typeToCurrInterval(type) {
    switch (type) {
        case 'week':
            return resetTimes([dayjs().day(0), dayjs().day(6)]);
        case 'month':
            return resetTimes([dayjs().date(1), dayjs().date(1).add(1, 'month').add(-1, 'day')]);
        case 'year':
            return resetTimes([dayjs().date(1).month(0), dayjs().month(11).date(1).add(1, "month").add(-1, "day") ]);
        case 'yesterday':
            return resetTimes([dayjs().add(-1, 'day'), dayjs().add(-1, 'day')]);
        case 'today':
        case 'day':
        default:
            return resetTimes([dayjs(), dayjs()]);
    }
}

function typeToPrevInterval(type) {
    switch (type) {
        case 'week':
            return resetTimes([dayjs().day(-1).day(0), dayjs().day(-1).day(6)]);

        case 'month':
            return resetTimes([dayjs().date(1).add(-1, 'month'), dayjs().date(-1)]);

        case 'year':
            return resetTimes([dayjs().month(0).date(-1).month(0), dayjs().month(0).date(-1)]);

        case 'yesterday':
            return resetTimes([dayjs().add(-2, 'day'), dayjs().add(-2, 'day')]);

        case 'today':
        case 'day':
        default:
            return resetTimes([dayjs().add(-1, 'day'), dayjs().add(-1, 'day')]);
    }
}

function getFormatsByInterval(interval) {
    let format, format2, format3
    if (interval === 'hours') {
        format = '%Y-%m-%d %H';
        format2 = 'YYYY-MM-DD H';
        format3 = "h a";
    } else if (interval === 'days') {
        format = '%Y-%m-%d';
        format2 = 'YYYY-MM-DD';
        format3 = "MMM, D";
    } else if (interval === 'weeks') {
        format = '%v';
        format2 = 'w';
        format3 = 'MMM, [Week #]w';
    } else if (interval === 'months') {
        format = '%Y-%m';
        format2 = 'YYYY-MM';
        format3 = 'MMM, YYYY';
    } else if (interval === 'years') {
        format = '%Y';
        format2 = 'YYYY';
        format3 = 'YYYY';
    } else {
        format = '%Y-%m-%d %H:%M:%S';
        format2 = 'YYYY-MM-DD H:m:s';
        format3 = 'YYYY-MM-DD';
    }

    return [format, format2, format3];
}

function typeToInterval(type) {
    switch (type) {
        case 'month':
            return 'days';
        case 'year':
            return 'months';
        case 'yesterday':
        case 'today':
        case 'day':
            return 'hours';
        case 'week':
        default:
            return 'days';
    }
}

function resetMinTime(date) {
    return date.hour(0).minute(0).second(0);
}

function resetMaxTime(date) {
    return date.hour(23).minute(59).second(59)
}

function resetTimes(date) {
    return [resetMinTime(date[0]), resetMaxTime(date[1])]
}

module.exports = {
    getNotification,
    getDashboard
}
