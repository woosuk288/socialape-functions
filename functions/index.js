const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, res) => {
  response.send("Hello from Firebase!");
});

exports.getScreams = functions.https.onRequest((req, res) => {
  admin
    .firestore()
    .collection("screams")
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push(doc.data());
      });
      return res.json(screams);
    })
    .catch(err => console.error(err));
});

exports.createScream = functions.https.onRequest((req, res) => {
  // POST요청 외에 다른 것 막기.
  if (req.method !== "POST") {
    return res.status(400).json({ error: "method not allowed" });
  }
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  };
  admin
    .firestore()
    .collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created succesfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "somthing went wrong" });
      console.error(err);
    });
});