const {createUID, createVertexQuery, createEdgeQuery, tgUpsert} = require("../../tg-helpers");
const {removeNull} = require("../../helpers");
const Schema = require("../../tg-schema");
const Joi = require("joi");

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const create = async (req, res) => {
    const location = req.body
    const id = createUID()
    const userId = req.userId

    const joiSchema = Joi.object({
        name: Joi.string().required(),
        pincode: Joi.string().required(),
        fee: Joi.number().required(),
        lat: Joi.number().required(),
        lng: Joi.number().required(),
        isActive: Joi.boolean().default(true)
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(location);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    value._id = id

    const vertex = createVertexQuery(Schema.Location, id, value)
    let edges = createEdgeQuery(Schema.Location.edges.LOCATION_CREATED_BY, id, userId, { time: new Date().toISOString() })

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({location: {...value, id}})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const patch = async (req, res) => {
    const location = req.body
    const id = req.params.id
    const userId = req.userId

    const joiSchema = Joi.object({
        name: Joi.string(),
        pincode: Joi.string(),
        fee: Joi.number(),
        lat: Joi.number(),
        lng: Joi.number(),
        isActive: Joi.boolean().default(true)
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(location);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    const vertex = createVertexQuery(Schema.Location, id, removeNull(value))
    let edges = createEdgeQuery(Schema.Location.edges.LOCATION_UPDATED_BY, id, userId, { time: new Date().toISOString() })

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({location: {...value, id}})
}

module.exports = {
    create,
    patch
}
