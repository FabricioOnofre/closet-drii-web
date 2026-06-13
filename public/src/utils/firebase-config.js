import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
// Garantindo a mesma versão exata do core do Firebase
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBcZxGVcS_QUE_F_FoRg36UH4jRfBojzrY",
  authDomain: "closet-drii-web.firebaseapp.com",
  projectId: "closet-drii-web",
  storageBucket: "closet-drii-web.firebasestorage.app",
  messagingSenderId: "140324159794",
  appId: "1:140324159794:web:7cf336ce9392ad2a5f572b",
  measurementId: "G-2NHM5BGN1W",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getFirestore(app);

export { auth, analytics, database };
