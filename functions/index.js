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

const FBAtuh = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(err => {
      // token expired or balcklisted or some other reason
      console.error("Error while verifying tokein ", err);
      return res.status(403).json(err);
    });
};

app.post("/scream", FBAtuh, (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle, // from middleware
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

const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
};

// Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = "Must  not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(newUser.password)) errors.password = "Must be not empty";
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (isEmpty(newUser.handle)) errors.handle = "Must be not empty";

  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

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

app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  let errors = {};

  if (isEmpty(user.email)) errors.email = "Must be not empty";
  if (isEmpty(user.password)) errors.password = "Must be not empty";
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      if (err.code === "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Wrong credentials, please try again" });
      } else {
        console.error(err);
        return res.status(500).json({ errors: err.code });
      }
    });
});

exports.api = functions.region("asia-northeast1").https.onRequest(app);
