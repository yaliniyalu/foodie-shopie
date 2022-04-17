const uuid = require('uuid');
const md5 = require('md5');
const api = require("../api");
const axios = require("axios");

function createUID() {
    return uuid.v4()
}

function createSID(...val) {
    return md5(val.join('_'))
}

function convertAttrToQuery(data) {
    const attributes = {}
    Object.keys(data).forEach(v => {
        attributes[v] = {value: data[v]}
    })
    return attributes
}

/**
 * @param schema {object}
 * @param id {string|number}
 * @param data {object}
 * */
function createVertexQuery(schema, id, data) {
    if (!id) id = uuid.v4()

    return {
        [schema.name]: {
            [id]: convertAttrToQuery(data)
        }
    }
}

function createEdgeQuery(edge, from, to, data = {}) {
    return {
        [edge.from]: {
            [from]: {
                [edge.name]: {
                    [edge.to]: {
                        [to]: convertAttrToQuery(data)
                    }
                }
            }
        }
    }
}

function mergeEdgeQuery(edges) {
    const merged = {}

    edges.forEach(edge => {
        Object.keys(edge).forEach(svt => { // Source Vertex Type
            if (!merged[svt]) {
                merged[svt] = edge[svt]
                return
            }

            Object.keys(edge[svt]).forEach(svi => { // Source Vertex Id
                if (!merged[svt][svi]) {
                    merged[svt][svi] = edge[svt][svi]
                    return
                }

                Object.keys(edge[svt][svi]).forEach(et => { // Edge Type
                    if (!merged[svt][svi][et]) {
                        merged[svt][svi][et] = edge[svt][svi][et]
                        return
                    }

                    Object.keys(edge[svt][svi][et]).forEach(tvt => { // Target Vertex Type
                        if (!merged[svt][svi][et][tvt]) {
                            merged[svt][svi][et][tvt] = edge[svt][svi][et][tvt]
                            return
                        }

                        Object.keys(edge[svt][svi][et][tvt]).forEach(tvi => { // Target Vertex Id
                            merged[svt][svi][et][tvt][tvi] = edge[svt][svi][et][tvt][tvi]
                        })
                    })
                })
            })
        })
    })

    return merged
}

function mergeVertexQuery(vertexes) {
    const merged = {}

    vertexes.forEach(vertex => {
        Object.keys(vertex).forEach(vt => { // Source Vertex Type
            if (!merged[vt]) {
                merged[vt] = vertex[vt]
                return
            }

            Object.keys(vertex[vt]).forEach(vi => { // Source Vertex Id
                merged[vt][vi] = vertex[vt][vi]
            })
        })
    })

    return merged
}

async function tgUpsert(vertices, edges = [], options = {triggers: true}) {
    if (!Array.isArray(vertices)) {
        vertices = [vertices]
    }

    if (!Array.isArray(edges)) {
        edges = [edges]
    }

    const mergedVertex = mergeVertexQuery(vertices)
    const mergedEdge = mergeEdgeQuery(edges)

    const response = await api.post('/graph/' + process.env.TG_GRAPH_NAME, {
        vertices: mergedVertex,
        edges: mergedEdge
    }, {
        headers: {'gsql-atomic-level': 'atomic'},
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    })

    if (response.data.error) {
        return Promise.reject(response.data)
    }

    if (!options.triggers) {
        return response.data
    }

    try {
        const Triggers = require("./tg-trigger");
        for (const vertexType in mergedVertex) {
            if (!Triggers[vertexType]) {
                return
            }

            const vertexAttr = Object.values(mergedVertex[vertexType])[0]
            const vertexId = Object.keys(mergedVertex[vertexType])[0]
            const data = {}
            for (const key in vertexAttr) {
                data[key] = vertexAttr[key]['value']
            }

            Triggers[vertexType](vertexId).catch(e => console.log(e.message))
        }
    } catch (e) {
        console.log(e.message)
    }

    return response.data
}

async function tgListVertex(name, select, filter) {
    const response = await api.get(`/graph/${process.env.TG_GRAPH_NAME}/vertices/${name}`)
}

async function tgListEdge(name, id) {
    return (await api.get(`/graph/${process.env.TG_GRAPH_NAME}/edges/${name}/${id}`)).data?.results ?? []
}

async function tgDeleteEdge(edge, from, to) {
    return (await api.delete(`/graph/${process.env.TG_GRAPH_NAME}/edges/${edge.from}/${from}/${edge.name}/${edge.to}/${to}`)).data
}

async function tgGetVertex(type, id) {
    const data = (await api.get(`/graph/${process.env.TG_GRAPH_NAME}/vertices/${type}/${id}`)).data
    if (data.error) {
        return Promise.reject(data)
    }
    return data
}

async function tgDeleteVertex(type, id) {
    return (await api.delete(`/graph/${process.env.TG_GRAPH_NAME}/vertices/${type}/${id}`)).data
}

async function tgGraphQlExecute(query, variables = {}) {
    console.log(query)
    const response = await axios.post(process.env.TG_GRAPHQL, {query, variables})

    if (response.data.errors) {
        console.log(response.data.errors[0])
        return Promise.reject(response.data.errors)
    }

    return response.data.data
}

async function getVertexUser(id) {
    const result = await tgGraphQlExecute(`query { Ecommerce { User(whereExpr: "_id == \\"${id}\\"") { id, name, email, phone, image, isActive } } }`)
    return result['Ecommerce']?.User[0] ?? []
}

module.exports = {
    createVertexQuery,
    createEdgeQuery,
    createUID,
    createSID,
    tgUpsert,
    tgGraphQlExecute,
    tgListEdge,
    tgDeleteEdge,
    tgGetVertex,
    tgDeleteVertex,
    getVertexUser,
}
