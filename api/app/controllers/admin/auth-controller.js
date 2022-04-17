const api = require("../../../api");
const {Response, getUploadedFileName} = require("../../helpers");
const bcrypt = require("bcrypt");
const {StatusCodes} = require("http-status-codes");
const jwt = require('jsonwebtoken');
const {createVertexQuery, createEdgeQuery, tgUpsert, getVertexUser} = require("../../tg-helpers");
const Schema = require("../../tg-schema");

/** @type {ExpressRequestHandler} */
const login = async (req, res) => {
    const email = req.body['email']
    const password = req.body['password']

    const response = await api.get(`/graph/${process.env.TG_GRAPH_NAME}/vertices/User?filter=email="${email}"&limit=1`)

    if (!response.data['results'][0]) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Invalid email or password"))
    }

    const user = response.data['results'][0]
    if (!await bcrypt.compare(password, user.attributes.password)) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Invalid email or password"))
    }

    const token = jwt.sign(user.attributes, process.env.JWT_SECRET, {expiresIn: '90d', subject: user.attributes.id, audience: 'admin'});

    res.json(Response.success({token: {token, expiresIn: 90 * 24 * 60 * 60}, user: user.attributes}))
}

/** @type {ExpressRequestHandler} */
const getMe = async (req, res) => {
    const result = await getVertexUser(req.userId)
    res.json(Response.success(result))
}

/** @type {ExpressRequestHandler} */
const patchMe = async (req, res) => {
    const userId = req.userId
    const user = req.body

    delete user.password
    delete user.isActive

    user.image = getUploadedFileName(user.image, 'admin')

    const vertex = createVertexQuery(Schema.User, userId, user)
    let edges = createEdgeQuery(Schema.User.edges.USER_UPDATED_BY, userId, userId, {time: new Date().toISOString()})

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res
            .status(400)
            .json(Response.error(e.message))
    }

    res.json(Response.success())
}

/** @type {ExpressRequestHandler} */
const updatePassword = async (req, res) => {
    const userId = req.userId
    const oldPass = req.body.authenticate
    const newPass = req.body.password

    const response = await api.get(`/graph/${process.env.TG_GRAPH_NAME}/vertices/User?filter=id="${userId}"&limit=1`)

    if (!response.data['results'][0]) {
        return res
            .status(StatusCodes.FORBIDDEN)
            .json(Response.error("Invalid email or password"))
    }

    const user = response.data['results'][0]
    if (!await bcrypt.compare(oldPass, user.attributes.password)) {
        return res
            .status(StatusCodes.FORBIDDEN)
            .json(Response.error("Invalid password"))
    }

    const password = await bcrypt.hash(newPass, await bcrypt.genSalt(10));


    const vertex = createVertexQuery(Schema.User, userId, {password})
    let edges = createEdgeQuery(Schema.User.edges.USER_UPDATED_BY, userId, userId, {time: new Date().toISOString()})

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res
            .status(400)
            .json(Response.error(e.message))
    }

    res.json(Response.success())
}

function logout(req, res) {
    res.sendSuccess()
}

module.exports = {
    login,
    logout,
    getMe,
    patchMe,
    updatePassword,
}
