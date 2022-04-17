const {createVertexQuery, createEdgeQuery, tgUpsert, tgDeleteVertex, createSID} = require("../../tg-helpers");
const Schema = require("../../tg-schema");
const Joi = require("joi");

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const create = async (req, res) => {
    const joiSchema = Joi.object({
        item: Joi.string().required(),
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    const id = createSID(Schema.TodayDeal.name, value.item)

    const vertex = createVertexQuery(Schema.TodayDeal, id, {})
    let edges = createEdgeQuery(Schema.TodayDeal.edges.TODAY_DEAL_HAS_ITEM, id, value.item)

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({todayDeal: {...value, id}})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const remove = async (req, res) => {
    const id = req.params.id

    try {
        await tgDeleteVertex(Schema.TodayDeal.name, createSID(Schema.TodayDeal.name, id))
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({})
}

module.exports = {
    create,
    remove
}
