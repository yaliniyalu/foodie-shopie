const fs = require("fs");

if (!fs.existsSync(__dirname + '/.env')) {
    console.error("[.env]: File not found.")
    process.exit()
}

if (!fs.existsSync(process.env.LOCAL_DIR + '/order-id.txt')) {
    console.error("[order-id.txt]: File Not found.")
    process.exit()
}

if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    console.error(`[GOOGLE_APPLICATION_CREDENTIALS]: File Not found.`)
    process.exit()
}

// CREATE DIRS
const dirs = [
    process.env.LOCAL_DIR + '/builder',
    process.env.UPLOAD_DIR + '/admin',
    process.env.UPLOAD_DIR + '/assets',
    process.env.UPLOAD_DIR + '/category',
    process.env.UPLOAD_DIR + '/home',
    process.env.UPLOAD_DIR + '/item',
    process.env.UPLOAD_DIR + '/temp'
]

for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
        logCreatingDir(dir)
        fs.mkdirSync(dir, {recursive: true});
    }
}

if (!fs.existsSync(process.env.LOCAL_DIR + '/orders.lock')) {
    logCreatingFile('orders.lock')
    fs.writeFileSync(process.env.LOCAL_DIR + '/orders.lock', '')
}

if (!fs.existsSync(process.env.LOCAL_DIR + '/settings.json')) {
    logCreatingFile('settings.json')
    fs.copyFileSync(__dirname + '/settings.json.example', process.env.LOCAL_DIR + '/settings.json');
}


function logCreatingFile(name) {
    console.log(`[${name}]: File not found.`)
    console.log(`[${name}]: Creating...`)
}

function logCreatingDir(name) {
    console.log(`[${name}]: Dir not found.`)
    console.log(`[${name}]: Creating...`)
}
