const functions = require("firebase-functions");
const app = require("express")();

const { db } = require("./util/admin");

const FBAtuh = require("./util/fbAuth");
const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  deleteScream,
  likeScream,
  unlikeScream
} = require("./handlers/screams");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead,
} = require("./handlers/user");

// Scream routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAtuh, postOneScream);
app.get("/scream/:screamId", getScream);
app.delete("/scream/:screamId", FBAtuh, deleteScream);
app.get("/scream/:screamId/like", FBAtuh, likeScream);
app.get("/scream/:screamId/unlike", FBAtuh, unlikeScream);
app.post('/scream/:screamId/comment', FBAtuh, commentOnScream);

// users routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAtuh, uploadImage);
app.post("/user", FBAtuh, addUserDetails);
app.get("/user", FBAtuh, getAuthenticatedUser);
app.get("/user/:handle", getUserDetails);
app.post('/notifications', FBAtuh, markNotificationsRead);

exports.api = functions.region("asia-northeast1").https.onRequest(app);

exports.createNotificationOnLike = functions
  .region("asia-northeast1")
  .firestore.document(`likes/{id}`)
  .onCreate(snapshot => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            read: false,
            screamId: doc.id,
            type: "like",
            createdAt: new Date().toISOString()
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });
exports.deleteNotificationOnLike = functions
  .region("asia-northeast1")
  .firestore.document(`likes/{id}`)
  .onDelete(snapshot => {
    db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions
  .region("asia-northeast1")
  .firestore.document(`comments/{id}`)
  .onCreate(snapshot => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            read: false,
            screamId: doc.id,
            type: "comment",
            createdAt: new Date().toISOString()
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });
