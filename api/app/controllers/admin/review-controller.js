const Joi = require("joi");
const {createVertexQuery, tgUpsert} = require("../../tg-helpers");
const Schema = require("../../tg-schema");
const {removeNull} = require("../../helpers");

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const patchStatus = async (req, res) => {
    const id = req.params.id

    const joiSchema = Joi.object({
        status: Joi.string().optional().valid( "Approved", "Rejected", "Pending"),
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    const vertex = createVertexQuery(Schema.ItemReview, id, removeNull(value))

    try {
        await tgUpsert(vertex)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const deleteReview = async (req, res) => {
    const id = req.params.id

    const vertex = createVertexQuery(Schema.ItemReview, id, removeNull({review: ''}))

    try {
        await tgUpsert(vertex)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({})
}


module.exports = {
    patchStatus,
    deleteReview
}
