const functions = require("firebase-functions");
const app = require("express")();

const FBAtuh = require("./util/fbAuth");
const { getAllScreams, postOneScream } = require("./handlers/screams");
const { signup, login, uploadImage } = require("./handlers/user");

// Scream routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAtuh, postOneScream);

// users routes
app.post("/signup", signup);
app.post("/login", login);
app.post('/user/image', FBAtuh, uploadImage);

exports.api = functions.region("asia-northeast1").https.onRequest(app);
