const AppSettings = require("../../helpers/app-settings");

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const get = async (req, res) => {
    const filter = req.query.filter

    let op = 'eq'
    let value = ''

    if (req.params.id) {
        op = 'eq'
        value = req.params.id
    } else {
        value = filter['id']
        if (typeof value === 'object') {
            op = Object.keys(value)[0]
            value = value[op]
        }
    }

    const settings = AppSettings.query(op, value).reduce((acc, v) => {
        acc[v.id] = v.value
        return acc
    }, {})

    res.sendSuccess(settings)
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
const update = async (req, res) => {
    req.body.forEach(v => {
        AppSettings.set(v.id, v.value)
    })

    try {
        await AppSettings.save()
    } catch (e) {
        return res.sendError("Unable to save")
    }

    res.sendSuccess({})
}


module.exports = {
    get, update
}
