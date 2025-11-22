// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjuIKGYzhdZsxpDO2R1R_K-DgtJmndV-8",
  authDomain: "myapp-64180.firebaseapp.com",
  projectId: "myapp-64180",
  storageBucket: "myapp-64180.appspot.com",
  messagingSenderId: "840366245930",
  appId: "1:840366245930:web:ca9ad2bcd066ffe40f5b53",
  measurementId: "G-G8BXV0Z2YT"
};

// EXPORT BOTH app and db
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
