const Geocode = require("../../helpers/geocode-helper");

async function getAddressByLocation(req, res) {
    if (!req.query['lat'] || !req.query['lng']) {
        return res.sendError("lat & lng is required")
    }

    const lat = req.query['lat'];
    const lng = req.query['lng'];

    try {
        return res.sendSuccess(await Geocode.getAddressByLatLng(lat, lng));
    } catch (e) {
        return res.status(503).send(e.message)
    }
}

async function getLocationByPincode(req, res) {
    if (!req.query['pincode']) {
        return res.sendError("Pincode is required")
    }

    const pincode = req.query['pincode'];
    try {
        return res.sendSuccess(await Geocode.getLocationByPincode(pincode));
    } catch (e) {
        return res.status(503).send(e.message)
    }
}

module.exports = {
    getLocationByPincode,
    getAddressByLocation
}
