const axios = require("axios");
const api = require("../../api");

async function getLocationByPincode(pincode) {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`)
    const res = response.data


    if (!res[0]?.PostOffice) {
        throw new Error('Not found')
    }

    let f = res[0]['PostOffice'].find(office => office['BranchType'] === "Head Post Office")
    if (!f) {
        f = res[0]['PostOffice'].find(office => office['BranchType'] === "Sub Post Office")
        if (!f) {
            f = res[0]['PostOffice'][0];
        }
    }

    return {
        pincode: pincode,
        location: f
    }
}

async function getAddressByLatLng(lat, lng) {
    const apiKey = process.env.GOOGLE_MAP_API_KEY;
    try {
        const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`)

        return {
            coords: {lat, lng},
            address: parseAddress(res.data)
        }
    } catch (e) {
        console.log(e)
        throw new Error('Api Error')
    }
}

function parseAddress(data) {
    const results = data['results'];
    if (!results.length) {
        return null;
    }

    const address = {
        street: '',
        address_1: '',
        address_2: '',
        city: '',
        landmark: '',
        pincode: '',
        district: '',
        state: '',
        country: '',
    }

    const shouldBeComponent = {
        street: ["premise", "street_address", "street_number"],
        landmark: ["landmark", "establishment", "point_of_interest", "route"],
        address_1: ['neighborhood', 'sublocality'],
        address_2: ["sublocality"],
        city: ["locality"],
        pincode: ["postal_code"],
        district: ['administrative_area_level_2'],
        state: ['administrative_area_level_1'],
        country: ["country"]
    };

    for (const [key, value] of Object.entries(shouldBeComponent)) {
        for (const result of results) {
            const addressComponents = result['address_components'];
            for (const str of value) {
                const i = findAddressComponent(str, addressComponents);
                if (i !== null) {
                    address[key] = addressComponents[i]['long_name'];
                    break;
                }
            }

            if (address[key]) {
                break;
            }
        }
    }

    return address;
}

function findAddressComponent(type, components) {
    for (const [i, adr] of Object.entries(components)) {
        if (adr['types'].includes(type)) {
            return i
        }
    }

    return null;
}

module.exports = {
    getLocationByPincode,
    getAddressByLatLng
}
