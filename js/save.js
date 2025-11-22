import { db, app } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const storage = getStorage(app); // IMPORTANT!

document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const link = document.getElementById("link").value;
  const copy = Number(document.getElementById("copy").value);

  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];

  document.getElementById("message").innerText = "Saving... Please wait.";

  let fileURL = "";

  try {
    // Upload file if selected
    if (file) {
      const filePath = `uploads/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, file);

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

    document.getElementById("message").innerText = "Saved successfully!";
    e.target.reset();

  } catch (error) {
    console.error("Error:", error);
    document.getElementById("message").innerText = "Failed to save data.";
  }
});
