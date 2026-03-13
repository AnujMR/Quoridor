// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHpx8UFSREpAyxpJJIDgi1sNDN3iBKSyA",
  authDomain: "quoridor-69.firebaseapp.com",
  projectId: "quoridor-69",
  storageBucket: "quoridor-69.firebasestorage.app",
  messagingSenderId: "427776277549",
  appId: "1:427776277549:web:1a08b2546f1241e18c4ca4",
  measurementId: "G-46KCR29P16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and export it so loginPage.jsx can use it
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();