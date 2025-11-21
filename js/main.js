import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const tableBody = document.getElementById("tableBody");

async function loadData() {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    tableBody.innerHTML = ""; // Clear table

    querySnapshot.forEach(doc => {
      const data = doc.data();

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${data.name || ""}</td>
        <td>${data.age || ""}</td>
        <td>${data.link ? `<a href="${data.link}" target="_blank">Link</a>` : ""}</td>
        <td>${data.copy || ""}</td>
        <td>
          ${data.fileURL 
            ? (data.fileURL.endsWith(".pdf") 
                ? `<a href="${data.fileURL}" target="_blank">PDF</a>` 
                : `<img src="${data.fileURL}" alt="file">`) 
            : ""}
        </td>
        <td>${data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : ""}</td>
      `;

      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error loading data:", error);
    tableBody.innerHTML = `<tr><td colspan="6">Failed to load data</td></tr>`;
  }
}

// Load data on page load
loadData();
