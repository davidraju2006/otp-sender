// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "your api key",
    authDomain: "yours",
    projectId: "otp-78dbd",
    storageBucket: "yours",
    messagingSenderId: "yors",
    appId: "yours",
    measurementId: "yours"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
