const {createSID, createVertexQuery, createEdgeQuery, tgUpsert} = require("../../tg-helpers");
const Schema = require("../../tg-schema");
const {tgExecuteSearch} = require("../../search-query");

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * @param next {e.NextFunction}
 * */
async function addViewLog(req, res, next) {
    if (!req.params.id) {
        return next()
    }

    const id = createSID(Schema.ItemViewedLog.name, req.params.id, req.userId)
    let log = {
        _itemId: req.params.id,
        _customerId: req.userId,
        viewedCount: 0
    }

    try {
        const result = await tgExecuteSearch({
            filter: {
                _customerId: log._customerId,
                _itemId: log._itemId
            }
        }, Schema.ItemViewedLog.name)

        if (result.length) {
            log = result[0]
            delete log.id
        }

        log.viewedCount++
        log.viewedOn = new Date().toISOString()

        const vertex = createVertexQuery(Schema.ItemViewedLog, id, log)
        const edges = []

        if (!result.length) {
            edges.push(
                createEdgeQuery(Schema.ItemViewedLog.edges.LOG_HAS_ITEM, id, log._itemId),
                createEdgeQuery(Schema.Customer.edges.CUSTOMER_VIEWED_LOG, log._customerId, id)
            )
        }

        await tgUpsert(vertex, edges)
    } catch (e) {
        console.log(e)
    }

    return next()
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
async function getLog(req, res) {
    const result = await tgExecuteSearch({
        filter: {
            _customerId: req.userId
        },
        include: 'item:id,name,price;item.discounts;item.images',
    }, Schema.ItemViewedLog.name)

    res.sendSuccess({viewLog: result})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
async function getRelated(req, res) {
    const result = await tgExecuteSearch({
        filter: {isActive: true},
        select: 'id,name,price',
        include: 'discounts;images',
    }, Schema.Item.name)

    res.sendSuccess({items: result.sort( () => Math.random() - 0.5).slice(0, 10)})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * @param next {e.NextFunction}
 * */
async function addArgs(req, res, next) {
    req.query['args'] = {
        Item: {
            cart: { customerId: req.userId },
            wishlist: { customerId: req.userId }
        }
    }
    next()
}

async function calcReviewInItem(items, req) {
    if (!req.query.withRating) {
        return items
    }

    for (const item of items) {
        const results = await tgExecuteSearch({filter: {_itemId: item.id}}, Schema.ItemReview.name)
        const s1 = results.filter(v => v.rating === 1)
        const s2 = results.filter(v => v.rating === 2)
        const s3 = results.filter(v => v.rating === 3)
        const s4 = results.filter(v => v.rating === 4)
        const s5 = results.filter(v => v.rating === 5)

        item.ratings = {
            1: s1.length, 2: s2.length, 3: s3.length, 4: s4.length, 5: s5.length
        }
        item.reviewCount = results.length
    }

    return items
}

async function transformTodayDeal(items, req) {
    return items.map(v => v.item[0])
}

module.exports = {
    addViewLog,
    addArgs,
    getRelated,
    getLog,
    calcReviewInItem,
    transformTodayDeal
}
