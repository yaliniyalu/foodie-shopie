const fs = require("fs");
const path = require("path");

const Response = {
    error(message, error, code = -1) {
        return { status: "error", error: message, code, data: error }
    },

    success(data) {
        return { status: "success", data, code: 0 }
    }
}

function time() {
    return Math.floor(Date.now() / 1000)
}

function getUploadedFileName(url, type) {
    if (!url) return ''

    const filename = url.substring(url.lastIndexOf('/') + 1);

    const src = path.resolve(process.env.UPLOAD_DIR, 'temp', filename)
    const dest = path.resolve(process.env.UPLOAD_DIR, type, filename)

    if (fs.existsSync(dest)) {
        return `/uploads/${type}/${filename}`;
    }

    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest)
        return `/uploads/${type}/${filename}`;
    }

    return ''
}

function getFileName(url, type) {
    if (!url) return ''

    const filename = url.substring(url.lastIndexOf('/') + 1);
    return `/uploads/${type}/${filename}`;
}

function removeNull(obj) {
    Object.keys(obj).forEach(v => {
        if (obj[v] === null || obj[v] === undefined) {
            delete obj[v]
        }
    })
    return obj
}


module.exports = {
    Response,
    time,
    getUploadedFileName,
    getFileName,
    removeNull
}
