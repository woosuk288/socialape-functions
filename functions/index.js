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
  markNotificationsRead
} = require("./handlers/user");

// Scream routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAtuh, postOneScream);
app.get("/scream/:screamId", getScream);
app.delete("/scream/:screamId", FBAtuh, deleteScream);
app.get("/scream/:screamId/like", FBAtuh, likeScream);
app.get("/scream/:screamId/unlike", FBAtuh, unlikeScream);
app.post("/scream/:screamId/comment", FBAtuh, commentOnScream);

// users routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAtuh, uploadImage);
app.post("/user", FBAtuh, addUserDetails);
app.get("/user", FBAtuh, getAuthenticatedUser);
app.get("/user/:handle", getUserDetails);
app.post("/notifications", FBAtuh, markNotificationsRead);

exports.api = functions.region("asia-northeast1").https.onRequest(app);

exports.createNotificationOnLike = functions
  .region("asia-northeast1")
  .firestore.document(`likes/{id}`)
  .onCreate(snapshot => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
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
      .catch(err => console.error(err));
  });
exports.deleteNotificationOnLike = functions
  .region("asia-northeast1")
  .firestore.document(`likes/{id}`)
  .onDelete(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => {
        console.error(err);
      });
  });

exports.createNotificationOnComment = functions
  .region("asia-northeast1")
  .firestore.document(`comments/{id}`)
  .onCreate(snapshot => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
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
      .catch(err => {
        console.error(err);
      });
  });

exports.onUserImageChange = functions
  .region("asia-northeast1")
  .firestore.document("/users/{userId}")
  .onUpdate(change => {
    console.log(change.before.data());
    console.log(change.after.data());

    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("Image changed");
      const batch = db.batch();
      return db
        .collection("screams")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const scream = db.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onScreamDelete = functions
  .region("asia-northeast1")
  .firestore.document("/screams/{screamId}")
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("screamId", "==", screamId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`comments/${doc.id}`));
        });
        return db
          .collection("likes")
          .where("screamId", "==", screamId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("screamId", "==", screamId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => console.error(err));
  });
