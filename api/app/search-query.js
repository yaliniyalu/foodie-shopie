const Schema = require("./tg-schema");
const {tgGraphQlExecute} = require("./tg-helpers");

function getCompQuery(f, v, op, isNot) {
    function __gv(v) {
        if (typeof v === "string") {
            return `"${v}"`
        }
        return v
    }

    if (v === true) {
        return f
    } else if (v === false) {
        return `NOT ${f}`
    }

    if (op.startsWith('n')) {
        op = op.substring(1)
        isNot = true
    }

    const mapOp = {
        eq: _ => `${f} == ${__gv(v)}`,
        ct: _ => `${f} LIKE "%${v}%"`,
        sw: _ => `${f} LIKE "${v}%"`,
        ew: _ => `${f} LIKE "%${v}"`,
        gt: _ => `${f} > ${__gv(v)}`,
        gte: _ => `${f} >= ${__gv(v)}`,
        lt: _ => `${f} < ${__gv(v)}`,
        lte: _ => `${f} <= ${__gv(v)}`,
        in: _ => v.map(_v => `(${f} == ${__gv(_v)})`).join(' OR '),
        bt: ''
    }

    const mapOpNot = {
        eq: _ => `${f} != ${__gv(v)}`,
        ct: _ => `${f} NOT LIKE "%${v}%"`,
        sw: _ => `${f} NOT LIKE "${v}%"`,
        ew: _ => `${f} NOT LIKE "%${v}"`,
        gt: _ => `NOT (${f} > ${__gv(v)})`,
        gte: _ => `NOT (${f} >= ${__gv(v)})`,
        lt: _ => `NOT (${f} < ${__gv(v)})`,
        lte: _ => `NOT (${f} <= ${__gv(v)})`,
        in: _ => v.map(_v => `(${f} != ${__gv(_v)})`).join(' AND '),
        bt: ''
    }

    if (isNot) {
        return mapOpNot[op]()
    } else {
        return mapOp[op]()
    }
}

function parseFilter(filterQuery) {
    const filter = []
    Object.keys(filterQuery ?? {}).forEach(field => {
        let val = filterQuery[field]
        let op = 'eq'
        let not = false

        if (typeof filterQuery[field] === "object") {
            val = Object.values(filterQuery[field])[0]
            op = Object.keys(filterQuery[field])[0]


            if (val['not']) {
                not = true
                val = val['not']
            }

            if (op === 'in') {
                if (typeof val === "string") {
                    val = val.split(',').map(v => v.trim())
                }
            }
        }

        if (val === 'true') {
            val = true
        } else if (val === 'false') {
            val = false
        }

        if (field === 'id') {
            field = '_id'
        }

        filter.push(getCompQuery(field, val, op, not))
    })

    return filter
}

/**
 * @param query {object}
 * @param vertex {String}
 * */
async function tgExecuteSearch(query, vertex) {
    let q = [];

    const sort = []
    const limit = query.limit
    const page = query['page']
    let select = []
    let includes = {}
    const filter = parseFilter(query.filter)


    if (query['sortByDesc']) {
        sort.push(...query['sortByDesc'].split(',').map(v => v.trim()).map(v => [v, 'desc']))
    }

    if (query['sortByAsc']) {
        sort.push(...query['sortByAsc'].split(',').map(v => v.trim()).map(v => [v, 'asc']))
    }

    if (query['select']) {
        select = query['select'].split(',').map(v => v.trim())
        const edgeFields = Object.values(Schema[vertex].edges).map(v => v.field)

        select.forEach(v => {
            if (edgeFields.includes(v)) {
                includes[v] = ['id']
            }
        })

        select = select.filter(v => Schema[vertex].fields.includes(v))
    } else {
        select = [...Schema[vertex].fields]
    }

    const vertexArgs = []

    if (filter.length) {
        vertexArgs.push('whereExpr: ' + JSON.stringify(filter.map(v => `(${v})`).join(' AND ')))
    }

    if (sort.length) {
        const s = [];
        sort.forEach(v => s.push(`{ ${v[0]} : ${v[1]} }`))
        vertexArgs.push(`order_by: [${s.join(', ')}]`)
    }

    if (limit > 0) {
        vertexArgs.push(`limit: ${limit}`)
    }

    if (page > 0) {
        const offset = ((page - 1) * limit + 1) - 1
        vertexArgs.push(`offset: ${offset}`)
    }

    if (query['include']) {
        query['include'].split(';').forEach(v => {
            const g = v.split(':')
            includes[g[0]] = g[1]?.split(',') ?? null
        })
    }

    function getIncludeGqlQuery(includes, parentVertex, args) {
        const incKeys = Object.keys(includes)
        const curIncKeys = incKeys.filter(v => !v.includes('.'))

        const edgeFields = Object.values(Schema[parentVertex].edges)

        const gql = []
        curIncKeys.forEach(key => {
            const ef = edgeFields.find(e => e.field === key)

            if (includes[key] === null) {
                includes[key] = Schema[ef.to].fields
            }

            const uf = Object.keys(ef.unpackFields ?? {}).join(',')

            const ql = [`${ef.name}`]

            if (ef.condition) {
                const ar = args[parentVertex]?.[key] ?? {};
                ql.push(`(where: ${ef.condition(ar)})`)
            }

            ql.push('{ to {')
            ql.push(includes[key].join(','))

            const subIncKeys = incKeys.filter(v => v.startsWith(key + '.'))
            if (subIncKeys.length) {
                const newIncludes = subIncKeys.reduce((a, v) => {
                    a[v.split('.').slice(1).join('.')] = includes[v]
                    return a
                }, {})

                const sql = getIncludeGqlQuery(newIncludes, ef.to, args)
                ql.push(sql)
            }

            ql.push('}')
            if (uf) {
                ql.push(',', uf)
            }
            ql.push('}')

            gql.push(ql.join(' '))
        })
        return gql.join(',');
    }

    if (Object.keys(includes).length) {
        select.push(getIncludeGqlQuery(includes, vertex, query.args ?? {}))
    }

    q.push(`query {`, 'Ecommerce {', [vertex, '(', vertexArgs.join(', '), ')', '{'].join(' ') )
    q.push(select.join(','))
    q.push('}', '}', '}')

    const qw = await tgGraphQlExecute(q.join('\n'))
    let data = qw['Ecommerce'][vertex] ?? []

    function parseResult(data, vertex) {
        const deleteFields = []
        Object.keys(data).forEach(k => {
            if (Schema[vertex].edges && Schema[vertex].edges[k]) {
                deleteFields.push(k)
                const ef = Schema[vertex].edges[k]

                if (ef.multiple) {
                    data[ef.field] = data[k].map(v => parseResult(v.to, ef.to))
                } else {
                    data[ef.field] = data[k][0]?.to ?? null
                    if (data[ef.field]) {
                        data[ef.field] = parseResult(data[ef.field], ef.to)
                    }

                    if (data[k][0] && Object.keys(data[k][0]).length > 1) {
                        Object.keys(data[k][0]).forEach(v1 => {
                            if (v1 === 'to') return

                            const value = data[k][0][v1]
                            if (ef.unpackFields && ef.unpackFields[v1]) {
                                data[ef.unpackFields[v1]] = value
                            } else {
                                data[v1] = value
                            }
                        })
                    }
                }
            }
        })

        deleteFields.forEach(f => delete data[f])
        return data
    }

    return data.map(v => parseResult(v, vertex))
}

async function tgExecuteFindOne(query, vertex) {
    const data = await tgExecuteSearch(query, vertex)
    if (!data.length) {
        throw new Error("Not Found")
    }

    return data[0]
}

async function tgExecuteCount(query, vertex) {
    const filter = parseFilter(query.filter)

    let whereExpr = ''
    if (filter.length) {
        whereExpr = '(whereExpr: ' + JSON.stringify(filter.map(v => `(${v})`).join(' AND ')) + ')'
    }

    const q = [`query {`, 'Ecommerce {', [vertex, whereExpr, '{'].join(' '), 'id', '}', '}', '}'].join('\n')

    const qw = await tgGraphQlExecute(q)
    return (qw['Ecommerce'][vertex] ?? []).length
}


module.exports = {
    tgExecuteSearch,
    tgExecuteFindOne,
    tgExecuteCount
}
