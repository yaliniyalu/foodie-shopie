const {createUID, createVertexQuery, createEdgeQuery, tgUpsert, tgListEdge, tgDeleteEdge} = require("../../tg-helpers");
const {getUploadedFileName, removeNull} = require("../../helpers");
const Schema = require("../../tg-schema");

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const create = async (req, res) => {
    const category = req.body
    const parentId = req.body._parentId
    const id = createUID()
    const userId = req.userId

    category._id = id
    category.image = getUploadedFileName(category.image, 'category')
    category.bannerImage = getUploadedFileName(category.bannerImage, 'category')

    const vertex = createVertexQuery(Schema.Category, id, removeNull(category))
    const edges = [createEdgeQuery(Schema.Category.edges.CATEGORY_CREATED_BY, id, userId, { time: new Date().toISOString() })]

    if (parentId) {
        edges.push(createEdgeQuery(Schema.Category.edges.PARENT_CATEGORY, id, parentId))
    }

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({category: {...category, id}})
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const patch = async (req, res) => {
    const category = req.body
    const id = req.params.id
    const userId = req.userId

    delete category.id;

    if (category.image !== undefined) {
        category.image = getUploadedFileName(category.image, 'category')
    }

    if (category.bannerImage !== undefined) {
        category.bannerImage = getUploadedFileName(category.bannerImage, 'category')
    }

    if (category._parentId !== undefined) {
        const edges = await tgListEdge('Category', id)
        console.log(edges)
        const p = edges.find(e => e['e_type'] === Schema.Category.edges.PARENT_CATEGORY.name)

        if (p) {
            if (p['to_id'] === category._parentId) {
                delete category._parentId
            } else {
                await tgDeleteEdge(Schema.Category.edges.PARENT_CATEGORY, p['from_id'], p['to_id'])
            }
        }
    }

    const vertex = createVertexQuery(Schema.Category, id, removeNull(category))
    const edges = [
        createEdgeQuery(Schema.Category.edges.CATEGORY_UPDATED_BY, id, userId, { time: new Date().toISOString() })
    ]

    if (category._parentId) {
        edges.push(createEdgeQuery(Schema.Category.edges.PARENT_CATEGORY, id, category._parentId))
    }

    try {
        await tgUpsert(vertex, edges)
    } catch (e) {
        return res.sendError(e.message)
    }

    res.sendSuccess({category: {...category, id}})
}

module.exports = {
    create,
    patch
}
