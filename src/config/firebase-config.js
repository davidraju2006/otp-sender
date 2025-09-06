
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const admin = require("firebase-admin");


const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


admin.initializeApp();

module.exports = { auth, admin };
