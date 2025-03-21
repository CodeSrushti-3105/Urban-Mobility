
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQd_C1aBJN53AMC0aedjWTTQLcSMWjObk",
  authDomain: "authentication-ece5f.firebaseapp.com",
  projectId: "authentication-ece5f",
  storageBucket: "authentication-ece5f.firebasestorage.app",
  messagingSenderId: "126665604003",
  appId: "1:126665604003:web:d97ed8a47f5f40bc4b7816"
};

// Initialize Firebase

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase modules
export { app, auth, db };
