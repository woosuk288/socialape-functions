const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();

admin.initializeApp();

const db = admin.firestore();

const config = {
  apiKey: "AIzaSyAEB2fP2FllmyoMrqL9iHmj8JQMT-JnVm0",
  authDomain: "socialappclone.firebaseapp.com",
  databaseURL: "https://socialappclone.firebaseio.com",
  projectId: "socialappclone",
  storageBucket: "socialappclone.appspot.com",
  messagingSenderId: "284406354157",
  appId: "1:284406354157:web:37a90b9ed759571e393ce4",
  measurementId: "G-446L61KBPB"
};

const firebase = require("firebase");
firebase.initializeApp(config);

app.get("/screams", (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return res.json(screams);
    })
    .catch(err => console.error(err));
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };
  db.collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created succesfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "somthing went wrong" });
      console.error(err);
    });
});

// Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  // TODO validate data
  let token, userId;
  db.doc(`/user/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
          .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
          })
          .then(idToken => {
            token = idToken;
            const userCredential = {
              handle: newUser.handle,
              email: newUser.email,
              createdAt: new Date().toISOString(),
              userId
            };
            return db.doc(`users/${newUser.handle}`).set(userCredential);
          })
          .then(() => {
            return res.status(201).json({ token });
          })
          .catch(err => {
            if (err.code === "auth/email-already-in-use") {
              return res.status(400).json({ email: "Email is already in use" });
            } else {
              return res.status(500).json({ error: err.code });
            }
          });
      }
    });
});

exports.api = functions.region("asia-northeast1").https.onRequest(app);
