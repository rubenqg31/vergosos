import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRyPsb1O4rzUUZxJZrDIrC3l7BWlXvdrk",
  authDomain: "vergosos.firebaseapp.com",
  projectId: "vergosos",
  storageBucket: "vergosos.firebasestorage.app",
  messagingSenderId: "856420892445",
  appId: "1:856420892445:web:90ec54e9d6dfdce3226bf4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
