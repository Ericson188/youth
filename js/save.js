// save.js
import { db, app } from "./firebase.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Initialize Firebase Storage
const storage = getStorage(app);

// Listen to form submit
document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const link = document.getElementById("link").value;
  const copy = Number(document.getElementById("copy").value);
  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];

  const message = document.getElementById("message");
  message.innerText = "Saving... Please wait.";

  let fileURL = "";

  try {
    // Upload file if selected
    if (file) {
      const filePath = `uploads/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      fileURL = await getDownloadURL(storageRef);
    }

    // Save data to Firestore
    await addDoc(collection(db, "users"), {
      name,
      link,
      copy,
      fileURL,
      createdAt: new Date()
    });

    message.innerHTML = "Saved successfully!";
    e.target.reset(); // Clear form

  } catch (error) {
    console.error("Error saving data:", error);
    message.innerHTML = "Failed to save data. Check console.";
  }
});
