let db = {
  users: [
    {
      user_id: "jR9RV944etT0RsVDIww3Cbpo3TH3",
      email: "user@gmail.com",
      handle: "user",
      createdAt: "2019-10-17T22:25:30.759Z",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/socialappclone.appspot.com/o/51591153.png?alt=media",
      bio: "hello my name is Wooseok Yang",
      website: "https://wooseok.com",
      location: "NewZealand Christchurch"
    }
  ],
  screams: [
    {
      userHandle: "user",
      body: "this is the scream body",
      createdAt: "2019-10-17T08:47:08.164Z",
      userImage: "",
      likeCount: 5,
      commentCount: 2
    }
  ],
  comments: [
    {
      userHandle: "user",
      screamId: "63PLVKs3XrgYZ5jZRUHt",
      body: "this is the scream body",
      createdAt: "2019-10-17T08:47:08.164Z",
    }
  ],
  notifications: [
    {
      recipient: 'user',
      sender: 'john',
      read : 'true } flase',
      screamId: "63PLVKs3XrgYZ5jZRUHt",
      type: 'like | comment',
      createdAt: "2019-10-17T08:47:08.164Z",
    }
  ]
};

const userDetails = {
  // redux data
  credential: {
    user_id: "jR9RV944etT0RsVDIww3Cbpo3TH3",
    email: "user@gmail.com",
    handle: "user",
    createdAt: "2019-10-17T22:25:30.759Z",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/socialappclone.appspot.com/o/51591153.png?alt=media",
    bio: "hello my name is Wooseok Yang",
    website: "https://wooseok.com",
    location: "NewZealand Christchurch"
  },
  likes: [
    {
      userHandle: "user",
      screamId: "63PLVKs3XrgYZ5jZRUHt"
    },
    {
      userHandle: "user",
      screamId: "9eNPshzq8B5kg79h34ur"
    }
  ]
};
