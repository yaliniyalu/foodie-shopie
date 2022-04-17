const Joi = require("joi");
const {createVertexQuery, tgUpsert, tgDeleteVertex} = require("../../tg-helpers");
const Schema = require("../../tg-schema");
const {removeNull} = require("../../helpers");

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const patch = async (req, res) => {
    const id = req.params.id

    const joiSchema = Joi.object({
        status: Joi.string().optional().valid( "Resolved", "Pending"),
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    const vertex = createVertexQuery(Schema.CustomerMessage, id, removeNull(value))

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
const deleteMessage = async (req, res) => {
    const id = req.params.id

    try {
        await tgDeleteVertex(Schema.CustomerMessage.name, id)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({})
}


module.exports = {
    patch,
    deleteMessage
}
