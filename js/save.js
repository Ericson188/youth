import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const link = document.getElementById("link").value;
  const copy = Number(document.getElementById("copy").value);

  document.getElementById("message").innerText = "Saving... Please wait.";

  try {
    // Save data to Firestore
    await addDoc(collection(db, "users"), {
      name,
      link,
      copy,
      createdAt: new Date()
    });

    document.getElementById("message").innerText = "Saved successfully!";
    e.target.reset();

  } catch (error) {
    console.error("Error:", error);
    document.getElementById("message").innerText = "Failed to save data.";
  }
});
