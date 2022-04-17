const admin = require("firebase-admin");

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

module.exports = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
