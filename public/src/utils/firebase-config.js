import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import { getAuth, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  connectFirestoreEmulator,
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

// Conecta aos emuladores locais quando rodando em localhost
if (location.hostname === "127.0.0.1" || location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(database, "127.0.0.1", 8080);
}

export { auth, analytics, database };
