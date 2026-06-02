// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcZxGVcS_QUE_F_FoRg36UH4jRfBojzrY",
  authDomain: "closet-drii-web.firebaseapp.com",
  projectId: "closet-drii-web",
  storageBucket: "closet-drii-web.firebasestorage.app",
  messagingSenderId: "140324159794",
  appId: "1:140324159794:web:7cf336ce9392ad2a5f572b",
  measurementId: "G-2NHM5BGN1W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);