const axios = require("axios");
const {tgExecuteSearch, tgExecuteCount} = require("../../search-query");

/** @type {ExpressRequestHandler} */
const graphql = async (req, res) => {
    const response = await axios.post(process.env.TG_GRAPHQL, req.body)
    res.json(response.data)
}

const search = (vertex, resultFields, formatter = null) => {
    return async (req, res) => {
        if (req.params.id) {
            req.query['filter'] = {_id: req.params.id}
        }

        try {
            let result = await tgExecuteSearch(req.query, vertex)
            if (formatter) {
                result = await formatter(result, req)
            }

            if (req.params.id) {
                return res.sendSuccess({[resultFields[0]]: result[0], totalCount: 1})
            }

            const count = await tgExecuteCount(req.query, vertex)

            return res.sendSuccess({[resultFields[1]]: result, totalCount: count})
        } catch (e) {
            return res.sendError(e.message)
        }
    }
}

module.exports = {
    graphql,
    search
}
