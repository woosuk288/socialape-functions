const admin = require("firebase-admin");

const config = require("./config");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: config.databaseURL,
  storageBucket: config.storageBucket
});

const db = admin.firestore();

module.exports = { admin, db };
