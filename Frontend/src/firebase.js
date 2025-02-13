import { getAuth } from "firebase/auth";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVfd6ND7oMEIpmuto7TJ0MyKqwc_A6V0U",
  authDomain: "tech-diary562.firebaseapp.com",
  projectId: "tech-diary562",
  storageBucket: "tech-diary562.firebasestorage.app",
  messagingSenderId: "786370433687",
  appId: "1:786370433687:web:f49eaf219c622ff4734fd2",
  measurementId: "G-M25XY2XYT5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);