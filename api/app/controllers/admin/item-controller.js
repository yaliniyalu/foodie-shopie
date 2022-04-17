const {createUID, createVertexQuery, createEdgeQuery, tgUpsert, tgListEdge, tgDeleteEdge,
    tgDeleteVertex, tgGetVertex, createSID
} = require("../../tg-helpers");
const {removeNull, getUploadedFileName, getFileName} = require("../../helpers");
const Schema = require("../../tg-schema");
const Joi = require("joi");

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const create = async (req, res) => {
    const item = req.body
    const id = createUID()
    const userId = req.userId

    const joiSchema = Joi.object({
        code: Joi.string().required(),
        name: Joi.string().required(),
        _categoryId: Joi.string().required(),
        unit: Joi.string().required(),
        isPack: Joi.boolean().required(),
        price: Joi.number().default(0)
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(item);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    value._id = id
    value.createdAt = new Date().toISOString()

    const vertex = createVertexQuery(Schema.Item, id, removeNull(value))
    const edges = [
        createEdgeQuery(Schema.Item.edges.ITEM_CREATED_BY, id, userId, { time: value.createdAt }),
        createEdgeQuery(Schema.Item.edges.ITEM_IN_CATEGORY, id, value._categoryId)
    ]

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({item: {...value, id}})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const patchBasic = async (req, res) => {
    const item = req.body
    const id = req.params.id
    const userId = req.userId

    const joiSchema = Joi.object({
        name: Joi.string().required(),
        _categoryId: Joi.string(),
        shortDescription: Joi.string().allow(""),
        description: Joi.string().allow(""),
        specification: Joi.string().allow(""),
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(item);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    if (value._categoryId) {
        const edges = await tgListEdge('Item', id)
        const p = edges.find(e => e['e_type'] === Schema.Item.edges.ITEM_IN_CATEGORY.name)
        if (p) {
            if (p['to_id'] === value._categoryId) {
                delete value._categoryId
            } else {
                await tgDeleteEdge(Schema.Item.edges.ITEM_IN_CATEGORY, p['from_id'], p['to_id'])
            }
        }
    }

    const vertex = createVertexQuery(Schema.Item, id, removeNull(value))
    const edges = [
        createEdgeQuery(Schema.Item.edges.ITEM_UPDATED_BY, id, userId, { time: new Date().toISOString() })
    ]

    if (value._categoryId) {
        edges.push(createEdgeQuery(Schema.Item.edges.ITEM_IN_CATEGORY, id, value._categoryId))
    }

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({item: {...value, id}})
}

const patchItem = async (req, res, joiSchema) => {
    const item = req.body
    const id = req.params.id
    const userId = req.userId

    const { error, value } = joiSchema.validate(item);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    const vertex = createVertexQuery(Schema.Item, id, removeNull(value))
    let edges = createEdgeQuery(Schema.Item.edges.ITEM_UPDATED_BY, id, userId, { time: new Date().toISOString() })

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({item: {...value, id}})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const patchStock = async (req, res) => {
    const joiSchema = Joi.object({
        maintainStock: Joi.boolean().required(),
        stock: Joi.number().default(0),
        isAvailable: Joi.boolean().required(),
        price: Joi.number().required()
    }).options({stripUnknown: true})

    await patchItem(req, res, joiSchema)
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const patchUnit = async (req, res) => {
    const joiSchema = Joi.object({
        unit: Joi.string().required(),
        isPack: Joi.boolean(),
        qtyPerSlice: Joi.number(),
        minOrderQty: Joi.number(),
        maxOrderQty: Joi.number(),
    }).options({stripUnknown: true})

    await patchItem(req, res, joiSchema)
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const patchStatus = async (req, res) => {
    const joiSchema = Joi.object({
        isActive: Joi.boolean().required(),
    }).options({stripUnknown: true})

    await patchItem(req, res, joiSchema)
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const patchImage = async (req, res) => {
    const item = req.body
    const id = req.params.id
    const userId = req.userId

    const joiSchema = Joi.object({
        image: Joi.string().required(),
        replace: Joi.string().allow('', null),
        isDefault: Joi.boolean().default(false),
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(item);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    value.image = getUploadedFileName(value.image, 'item')

    if (value.replace) {
        const iid = createSID(Schema.ItemImage.name, getFileName(value.replace, 'item'))
        await tgDeleteEdge(Schema.Item.edges.ITEM_HAS_IMAGE, id, iid)
        await tgDeleteVertex(Schema.Item.name, iid)
    }

    const vertex = createVertexQuery(Schema.ItemImage, createSID(Schema.ItemImage.name, value.image), removeNull({image: value.image, isDefault: value.isDefault}))
    const edges = [
        createEdgeQuery(Schema.Item.edges.ITEM_UPDATED_BY, id, userId, { time: new Date().toISOString() }),
        createEdgeQuery(Schema.Item.edges.ITEM_HAS_IMAGE, id, createSID(Schema.ItemImage.name, value.image), {})
    ]

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({item: {...value, id}})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const patchDiscounts = async (req, res) => {
    const item = req.body
    const id = req.params.id
    const userId = req.userId

    const joiSchema = Joi.object({
        discounts: Joi.array().items({
            value: Joi.number().required(),
            type: Joi.string().valid("Percent", "Amount").required(),
            customer: Joi.string().valid("Normal", "Prime").required(),
        })
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(item);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    const vertexes = []
    const edges = [
        createEdgeQuery(Schema.Item.edges.ITEM_UPDATED_BY, id, userId, { time: new Date().toISOString() }),
    ]

    for (const discount of value.discounts) {
        const iid = createSID(Schema.ItemDiscount.name, id, discount.customer)
        vertexes.push(createVertexQuery(Schema.ItemDiscount, iid, removeNull({
            discountType: discount.type,
            discountValue: discount.value,
            customerType: discount.customer
        })))

        try {
            await tgGetVertex(Schema.ItemDiscount.name, iid)
        } catch (e) {
            edges.push(createEdgeQuery(Schema.Item.edges.ITEM_HAS_DISCOUNT, id, iid))
        }
    }

    try {
        await tgUpsert(vertexes, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({item: {...value, id}})
}

module.exports = {
    create,
    patchBasic,
    patchStock,
    patchUnit,
    patchStatus,
    patchImage,
    patchDiscounts
}
