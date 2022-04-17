const {createUID, createVertexQuery, createEdgeQuery, tgUpsert} = require("../../tg-helpers");
const {removeNull} = require("../../helpers");
const Schema = require("../../tg-schema");
const Joi = require("joi");

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const create = async (req, res) => {
    const coupon = req.body
    const id = createUID()
    const userId = req.userId

    const joiSchema = Joi.object({
        code: Joi.string().required(),
        customerType: Joi.string().valid("", "Normal", "Prime").required(),
        discountType: Joi.string().valid("Percent", "Amount").required(),
        discountValue: Joi.number().required(),
        maxDiscountValue: Joi.number().empty(['', null]).default(0),
        minOrderValue: Joi.number().empty(['', null]).default(0),
        usageLimit: Joi.number().empty(['', null]).default(0),
        expiresOn: Joi.date().required(),
        isActive: Joi.boolean().default(true)
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(coupon);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    value._id = id

    const vertex = createVertexQuery(Schema.Coupon, id, removeNull(value))
    let edges = createEdgeQuery(Schema.Coupon.edges.COUPON_CREATED_BY, id, userId, { time: new Date().toISOString() })

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({coupon: {...value, id}})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const patch = async (req, res) => {
    const coupon = req.body
    const id = req.params.id
    const userId = req.userId

    const joiSchema = Joi.object({
        code: Joi.string(),
        customerType: Joi.string().valid("", "Normal", "Prime"),
        discountType: Joi.string().valid("Percent", "Amount"),
        discountValue: Joi.number(),
        maxDiscountValue: Joi.number().failover(0),
        minOrderValue: Joi.number().failover(0),
        usageLimit: Joi.number().failover(0),
        expiresOn: Joi.date(),
        isActive: Joi.boolean()
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(coupon);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    const vertex = createVertexQuery(Schema.Coupon, id, removeNull(value))
    let edges = createEdgeQuery(Schema.Coupon.edges.COUPON_UPDATED_BY, id, userId, { time: new Date().toISOString() })

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({coupon: {...value, id}})
}

module.exports = {
    create,
    patch
}
