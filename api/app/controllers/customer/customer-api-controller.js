const AppSettings = require("../../helpers/app-settings");
const {tgExecuteSearch} = require("../../search-query");
const Joi = require("joi");
const {createUID, createVertexQuery, createEdgeQuery, tgUpsert, createSID} = require("../../tg-helpers");
const Schema = require("../../tg-schema");

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const getAllCategory = async (req, res) => {
    const query = {
        select: ['id', 'name', 'description', 'image', 'bannerImage', '_parentId'].join(','),
        filter: {
            isActive: true,
            _parentId: ""
        },
        include: 'subCategory'
    }

    try {
        const data = await tgExecuteSearch(query, 'Category')
        res.sendSuccess(data)
    } catch (e) {
        return res.sendError(e.message)
    }
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
function getSettings(req, res) {
    const settings = AppSettings.get([
        'company.name', 'company.tagline', 'company.logo', 'company.contact',
        'payment.refund.fee.max', 'payment.refund.fee.min', 'payment.refund.fee.type'
    ]);
    return res.sendSuccess(settings);
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
function getTerms(req, res) {
    return res.sendSuccess(AppSettings.get('company.terms'));
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
function getPrivacy(req, res) {
    return res.sendSuccess(AppSettings.get('company.privacy'));
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
async function createComplaint(req, res) {
    const id = createUID()

    const joiSchema = Joi.object({
        message: Joi.string().required(),
        name: Joi.string().required(),
        phone: Joi.required(),
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    value._id = id
    value.status = 'Pending'
    value.createdAt = new Date().toISOString()

    const edges = []
    if (req.userId) {
        value._customerId = req.userId
        edges.push(createEdgeQuery(Schema.CustomerMessage.edges.CUSTOMER_MESSAGE_CREATED_BY, id, req.userId))
    }

    const vertex = createVertexQuery(Schema.CustomerMessage, id, value)

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
async function createReview(req, res) {
    const joiSchema = Joi.object({
        itemId: Joi.string().required(),
        rating: Joi.number().required(),
        review: Joi.string().allow('', null),
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    const iid = createSID(Schema.ItemReview.name, value.itemId, req.userId)
    const itemReview = {
        _id: iid,
        _customerId: req.userId,
        _itemId: value.itemId,
        review: value.review,
        rating: value.rating,
        status: 'Pending',
        createdAt: new Date().toISOString()
    }

    const edges = [
        createEdgeQuery(Schema.Item.edges.ITEM_HAS_REVIEW, itemReview._itemId, iid),
        createEdgeQuery(Schema.Customer.edges.CUSTOMER_WRITES_REVIEW, itemReview._customerId, iid)
    ]

    const vertex = createVertexQuery(Schema.ItemReview, iid, itemReview)

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {

    }

    res.sendSuccess({})
}

async function getLocations(req, res) {
    try {
        const data = await tgExecuteSearch({
            filter: {isActive: true},
            select: 'id,name,pincode,fee',
            orderByAsc: 'name'
        }, Schema.Location.name)
        res.sendSuccess(data)
    } catch (e) {
        return res.sendError(e.message)
    }
}

module.exports = {
    getAllCategory,
    getSettings,
    getTerms,
    getPrivacy,
    createComplaint,
    createReview,
    getLocations
}
