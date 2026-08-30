import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDh3M7eJGTJoh2w1PElkHLKgUPCleloFW8",
  authDomain: "care4removals-fd53c.firebaseapp.com",
  projectId: "care4removals-fd53c",
  storageBucket: "care4removals-fd53c.firebasestorage.app",
  messagingSenderId: "809281353111",
  appId: "1:809281353111:web:2842d006b9169c272840d2",
  measurementId: "G-67RF7PJGRC"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };