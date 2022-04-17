const Joi = require("joi");
const firebaseApp = require("../../../firebase");
const {tgExecuteSearch} = require("../../search-query");
const Schema = require("../../tg-schema");
const {tgUpsert, createVertexQuery, createUID, createEdgeQuery, tgDeleteVertex} = require("../../tg-helpers");
const jwt = require("jsonwebtoken");
const {Response} = require("../../helpers");
const {StatusCodes} = require("http-status-codes");

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
async function login(req, res) {
    const joiSchema = Joi.object({
        idToken: Joi.string().required()
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    const idToken = value.idToken

    let result = []
    let phone = null
    try {
        const {phone_number} = await firebaseApp.auth().verifyIdToken(idToken, true)
        phone = phone_number.replace('+91', '');
    } catch (e) {
        return res.sendError("Invalid token")
    }

    try {
        result = await tgExecuteSearch({filter: {phone}}, Schema.Customer.name)
    } catch (e) {
        console.log(e)
        return res.sendError("Server error")
    }

    let user = null
    let type = 'login'
    if (!result.length) {
        type = 'register'
        const id = createUID()
        user = {
            _id: id,
            customerType: 'Normal',
            phone,
            name: '',
            isActive: true,
            createdAt: new Date().toISOString()
        }

        await tgUpsert(createVertexQuery(Schema.Customer, id, user), [])
        user.id = id
    } else {
        user = {
            id: result[0].id,
            name: result[0].name,
            customerType: result[0].customerType,
            phone: result[0].phone,
            isActive: result[0].isActive,
            createdAt: result[0].createdAt,
        }
    }

    if (!user.isActive) {
        return res.sendError("You are banned")
    }

    try {
        const sessionId = createUID()
        await tgUpsert(
            createVertexQuery(Schema.AuthSession, sessionId, {_customerId: user.id, _id: sessionId}),
            createEdgeQuery(Schema.AuthSession.edges.AUTH_SESSION_FOR_CUSTOMER, sessionId, user.id)
        )
        user.sessionId = sessionId
    } catch (e) {
        return res.status(500).sendError("Internal Server Error")
    }

    const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '90d', subject: user.id, audience: 'customer'});

    res.json({token: {token, expiresIn: 90 * 24 * 60 * 60}, user, type})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
async function getMe(req, res) {
    try {
        const result = await tgExecuteSearch({filter: {_id: req.userId, isActive: true}}, Schema.Customer.name)
        if (!result[0]) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(Response.error("Unauthorized"))
        }
        res.sendSuccess(result[0])
    } catch (e) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(Response.error("Unauthorized"))
    }
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
async function refresh(req, res) {
    try {
        const result = await tgExecuteSearch({filter: {_id: req.userId, isActive: true}}, Schema.Customer.name)
        if (!result.length) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(Response.error("Unauthorized"))
        }

        const user = {
            id: result[0].id,
            name: result[0].name,
            customerType: result[0].customerType,
            phone: result[0].phone,
            isActive: result[0].isActive,
            createdAt: result[0].createdAt,
        }

        const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '90d', subject: user.id, audience: 'customer'});
        res.json({token: {token, expiresIn: 90 * 24 * 60 * 60}, user})
    } catch (e) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(Response.error("Unauthorized"))
    }
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
function logout(req, res) {
    tgDeleteVertex(Schema.AuthSession.name, req.user?.sessionId)
        .then()
        .catch()

    res.sendSuccess({})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
async function updateFcm(req, res) {
    const fcmId = req.body.fcmId
    const sessionId = req.user.sessionId

    try {
        await tgUpsert(createVertexQuery(Schema.AuthSession, sessionId, {fcmId}), [])
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
async function patchMe(req, res) {

    const joiSchema = Joi.object({
        name: Joi.string().allow("", null),
        email: Joi.string().email().allow("", null),
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    try {
        await tgUpsert(createVertexQuery(Schema.Customer, req.userId, value), [])
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({})
}

module.exports = {
    login,
    refresh,
    getMe,
    logout,
    updateFcm,
    patchMe
}
