import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  // pega aquí lo que te dio Firebase (apiKey, authDomain, projectId...)
  // Import the functions you need from the SDKs you nee
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRyPsb1O4rzUUZxJZrDIrC3l7BWlXvdrk",
  authDomain: "vergosos.firebaseapp.com",
  projectId: "vergosos",
  storageBucket: "vergosos.firebasestorage.app",
  messagingSenderId: "856420892445",
  appId: "1:856420892445:web:90ec54e9d6dfdce3226bf4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
