const express = require('express')
const cors = require("cors");

require('dotenv').config();
require('./boot.js')

const errorHandler = require("./app/middlewares/error-handler");
const {authenticate} = require("./app/middlewares/auth-middleware");
const {responseMiddleware} = require("./app/middlewares/response-middleware");

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors())

app.use(responseMiddleware)
app.use('/uploads', express.static(process.env.UPLOAD_DIR));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})

app.use('/api/admin', authenticate('admin'), require('./routes/admin'));
app.use('/api/customer', authenticate('customer'), require('./routes/customer'));
app.use(errorHandler)

app.listen(process.env.APP_PORT, () => {
    console.log("Your app is listening on port http://localhost:" + process.env.APP_PORT + "/");
});
