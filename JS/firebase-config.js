// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_pAG-_0w2QqeVjHuH-dIyZa_yivlVCj0",
  authDomain: "restaurante-21840.firebaseapp.com",
  databaseURL: "https://restaurante-21840-default-rtdb.firebaseio.com",
  projectId: "restaurante-21840",
  storageBucket: "restaurante-21840.firebasestorage.app",
  messagingSenderId: "149162558216",
  appId: "1:149162558216:web:2187ba86cf0b74dc15e2bd",
  measurementId: "G-94L1KYZ5V1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);