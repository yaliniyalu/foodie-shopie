const {tgExecuteSearch} = require("./search-query");
const Schema = require("./tg-schema");
const {tgUpsert, createVertexQuery} = require("./tg-helpers");

async function triggerReview(id) {
    const review = (await tgExecuteSearch({filter: {_id: id}, select: '_itemId,_customerId'}, Schema.ItemReview.name))[0]
    const data = await tgExecuteSearch({filter: {_itemId: review._itemId}, select: 'rating,status,review'}, Schema.ItemReview.name)
    const data2 = await tgExecuteSearch({filter: {_customerId: review._customerId}, select: 'status,review'}, Schema.ItemReview.name)

    const r5 = data.filter(v => v.rating === 5).map(v => v.rating).reduce(acc => acc++, 0)
    const r4 = data.filter(v => v.rating === 4).map(v => v.rating).reduce(acc => acc++, 0)
    const r3 = data.filter(v => v.rating === 3).map(v => v.rating).reduce(acc => acc++, 0)
    const r2 = data.filter(v => v.rating === 2).map(v => v.rating).reduce(acc => acc++, 0)
    const r1 = data.filter(v => v.rating === 1).map(v => v.rating).reduce(acc => acc++, 0)

    const r = {
        rating: ((5*r5)+(4*r4)+(3*r3)+(2*r2)+(1*r1)) / (r5+r4+r3+r2+r1),
        ratingCount: data.length,
        reviewCount: data.filter(v => v.status === 'Approved' && v.review).length
    }

    const rr = {
        statTotalReviews: data2.filter(v => v.status === 'Approved' && v.review).length,
        statTotalReviewsCancelled: data2.filter(v => v.status === 'Rejected' && v.review).length
    }

    const vertex = createVertexQuery(Schema.Item, review._itemId, r)
    const vertex2 = createVertexQuery(Schema.Customer, review._customerId, rr)

    await tgUpsert([vertex, vertex2], [])
}


const Triggers = {
    [Schema.ItemReview.name]: triggerReview
}

module.exports = Triggers
