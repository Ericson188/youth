// Import the functions you need from the SDKs you need

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjuIKGYzhdZsxpDO2R1R_K-DgtJmndV-8",
  authDomain: "myapp-64180.firebaseapp.com",
  projectId: "myapp-64180",
  storageBucket: "myapp-64180.firebasestorage.app",
  messagingSenderId: "840366245930",
  appId: "1:840366245930:web:ca9ad2bcd066ffe40f5b53",
  measurementId: "G-G8BXV0Z2YT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

