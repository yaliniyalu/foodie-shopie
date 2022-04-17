const Joi = require("joi");
const {createVertexQuery, createEdgeQuery, tgUpsert} = require("../../tg-helpers");
const Schema = require("../../tg-schema");
const {removeNull} = require("../../helpers");

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const patch = async (req, res) => {
    const id = req.params.id

    const joiSchema = Joi.object({
        customerType: Joi.string().optional().valid( "Normal", "Prime"),
        isActive: Joi.boolean().optional()
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    const vertex = createVertexQuery(Schema.Customer, id, removeNull(value))

    try {
        await tgUpsert(vertex)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({customer: {...value, id}})
}

module.exports = {
    patch
}
