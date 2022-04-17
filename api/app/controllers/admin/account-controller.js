const {createUID, createVertexQuery, createEdgeQuery, tgUpsert} = require("../../tg-helpers");
const {getUploadedFileName, removeNull} = require("../../helpers");
const Schema = require("../../tg-schema");

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const create = async (req, res) => {
    const user = req.body
    const id = createUID()
    const userId = req.userId

    user._id = id
    user.image = getUploadedFileName(user.image, 'admin')

    const vertex = createVertexQuery(Schema.User, id, user)
    let edges = createEdgeQuery(Schema.User.edges.USER_CREATED_BY, id, userId, { time: new Date().toISOString() })

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({account: {...user, id}})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const patch = async (req, res) => {
    const user = req.body
    const id = req.params.id
    const userId = req.userId

    if (user.image !== undefined) {
        user.image = getUploadedFileName(user.image, 'admin')
    }

    const vertex = createVertexQuery(Schema.User, id, removeNull(user))
    let edges = createEdgeQuery(Schema.User.edges.USER_UPDATED_BY, id, userId, { time: new Date().toISOString() })

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({account: {...user, id}})
}

module.exports = {
    create,
    patch
}
