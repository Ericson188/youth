import { db } from "./firebase.js";
import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById("userForm");
const messageEl = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const link = document.getElementById("link").value.trim();
  const copyValue = document.getElementById("copy").value;
  const copy = copyValue ? Number(copyValue) : 1;

  // 🔒 Basic validation
  if (!name) {
    messageEl.innerText = "Name is required.";
    return;
  }

  // Disable button while saving
  submitBtn.disabled = true;
  submitBtn.innerText = "Saving...";
  messageEl.innerText = "Saving... Please wait.";

  try {
    // Save data to Firestore
    await addDoc(collection(db, "users"), {
      name,
      link,
      copy,
      createdAt: new Date()
    });

    messageEl.innerText = "Saved successfully! Redirecting...";
    form.reset();

    // ⏳ Redirect after success
    setTimeout(() => {
      window.location.href =
        "https://drive.google.com/drive/folders/1h1iQBnOVF5Xi5Jl-84Wrle6PVGkoAW_1";
    }, 1000);

  } catch (error) {
    console.error("Error:", error);
    messageEl.innerText = "Failed to save data. Please try again.";
    submitBtn.disabled = false;
    submitBtn.innerText = "Save Information";
  }
});
