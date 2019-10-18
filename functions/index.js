const functions = require("firebase-functions");
const app = require("express")();

const FBAtuh = require("./util/fbAuth");
const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream
} = require("./handlers/screams");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require("./handlers/user");

// Scream routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAtuh, postOneScream);
app.get("/scream/:screamId", getScream);
// TODO: delete scream
// TODO: like a scream
// TODO: unlike a scream
app.post(`/scream/:screamId/comment`, FBAtuh, commentOnScream)

// users routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAtuh, uploadImage);
app.post("/user", FBAtuh, addUserDetails);
app.get("/user", FBAtuh, getAuthenticatedUser);

exports.api = functions.region("asia-northeast1").https.onRequest(app);
