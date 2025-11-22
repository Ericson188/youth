import { db } from "./firebase.js";
import { 
  collection, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// DOM elements
const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const totalCount = document.getElementById("totalCount");
const lastUpdated = document.getElementById("lastUpdated");
const emptyState = document.getElementById("emptyState");
const startIndex = document.getElementById("startIndex");
const endIndex = document.getElementById("endIndex");
const totalRecords = document.getElementById("totalRecords");
const firstPage = document.getElementById("firstPage");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const lastPage = document.getElementById("lastPage");

// Modal elements
const userModal = document.getElementById("userModal");
const deleteModal = document.getElementById("deleteModal");
const userForm = document.getElementById("userForm");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModal");
const closeDeleteModalBtn = document.getElementById("closeDeleteModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

// Form elements
const userIdInput = document.getElementById("userIdInput");
const userNameInput = document.getElementById("userNameInput");
const userLinkInput = document.getElementById("userLinkInput");
const userCopyInput = document.getElementById("userCopyInput");

// Global variables
let usersData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;
let currentSort = { field: 'createdAt', direction: 'desc' };
let userToDelete = null;

// Initialize the application
function init() {
  loadData();
  setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
  // Modal controls
  closeModalBtn.addEventListener('click', () => closeUserModal());
  closeDeleteModalBtn.addEventListener('click', () => closeDeleteModal());
  cancelBtn.addEventListener('click', () => closeUserModal());
  cancelDeleteBtn.addEventListener('click', () => closeDeleteModal());
  confirmDeleteBtn.addEventListener('click', () => deleteUser());
  
  // Form submission
  userForm.addEventListener('submit', handleFormSubmit);
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === userModal) closeUserModal();
    if (e.target === deleteModal) closeDeleteModal();
  });

  // Search functionality
  searchInput.addEventListener('input', handleSearch);
  
  // Sort functionality
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => handleSort(th));
  });
  
  // Pagination controls
  firstPage.addEventListener('click', goToFirstPage);
  prevPage.addEventListener('click', goToPrevPage);
  nextPage.addEventListener('click', goToNextPage);
  lastPage.addEventListener('click', goToLastPage);
}

// Load data from Firestore
async function loadData() {
  try {
    showLoadingState();

    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    usersData = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      usersData.push({
        id: doc.id,
        name: data.name || "",
        link: data.link || "",
        copy: data.copy || "",
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
      });
    });

    filteredData = [...usersData];
    updateTable();
    updatePagination();
    updateStats();

  } catch (error) {
    console.error("Error loading data:", error);
    showErrorState("Failed to load data. Please try again later.");
  }
}

// Show loading state
function showLoadingState() {
  tableBody.innerHTML = `
    <tr class="loading">
      <td colspan="5">
        <div class="spinner"></div>
      </td>
    </tr>
  `;
}

// Show error state
function showErrorState(message) {
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align: center; color: var(--danger);">
        ${message}
      </td>
    </tr>
  `;
}

// Update table with current data
function updateTable() {
  if (filteredData.length === 0) {
    tableBody.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  
  // Calculate pagination
  const start = (currentPage - 1) * rowsPerPage;
  const end = Math.min(start + rowsPerPage, filteredData.length);
  const pageData = filteredData.slice(start, end);

  let tableHTML = "";
  
  pageData.forEach(user => {
    const createdAt = user.createdAt.toLocaleString();
    
    tableHTML += `
      <tr>
        <td class="name-cell">${escapeHtml(user.name)}</td>
        <td class="link-cell">
          ${user.link ? `<a href="${escapeHtml(user.link)}" target="_blank"><i class="fas fa-external-link-alt"></i> Link</a>` : "-"}
        </td>
        <td class="copy-cell">
          ${user.copy ? escapeHtml(user.copy) : "-"}
          ${user.copy ? `<button class="copy-btn" data-text="${escapeHtml(user.copy)}"><i class="far fa-copy"></i></button>` : ""}
        </td>
        <td class="date-cell">${createdAt}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn edit" data-id="${user.id}" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" data-id="${user.id}" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  
  tableBody.innerHTML = tableHTML;
  
  // Add event listeners to action buttons
  addActionButtonListeners();
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Add event listeners to action buttons
function addActionButtonListeners() {
  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btn.getAttribute('data-text');
      navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback(btn);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    });
  });
  
  // Edit buttons - use event delegation
  tableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.action-btn.edit');
    if (editBtn) {
      e.preventDefault();
      e.stopPropagation();
      const userId = editBtn.getAttribute('data-id');
      console.log('Edit button clicked for user:', userId);
      editUser(userId);
    }
  });
  
  // Delete buttons - use event delegation
  tableBody.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.action-btn.delete');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const userId = deleteBtn.getAttribute('data-id');
      console.log('Delete button clicked for user:', userId);
      confirmDeleteUser(userId);
    }
  });
}

// Show copy feedback
function showCopyFeedback(btn) {
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check"></i>';
  btn.style.color = 'var(--success)';
  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.style.color = '';
  }, 1000);
}

// Open user modal for editing
function openUserModal(user) {
  console.log('Opening modal for user:', user);
  modalTitle.textContent = "Edit User";
  userIdInput.value = user.id;
  userNameInput.value = user.name;
  userLinkInput.value = user.link || '';
  userCopyInput.value = user.copy || '';
  userModal.style.display = "flex";
}

// Close user modal
function closeUserModal() {
  userModal.style.display = "none";
  userForm.reset();
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  console.log('Form submitted');
  
  const userData = {
    name: userNameInput.value.trim(),
    link: userLinkInput.value.trim(),
    copy: userCopyInput.value.trim(),
    updatedAt: serverTimestamp()
  };
  
  // Basic validation
  if (!userData.name) {
    alert("Please enter a name");
    return;
  }
  
  try {
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    saveBtn.disabled = true;
    
    // Update existing user
    console.log('Updating user:', userIdInput.value, userData);
    await updateDoc(doc(db, "users", userIdInput.value), userData);
    
    closeUserModal();
    await loadData(); // Reload data to reflect changes
    
    saveBtn.innerHTML = originalText;
    saveBtn.disabled = false;
    
  } catch (error) {
    console.error("Error updating user:", error);
    alert("Error updating user. Please try again.");
    
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.innerHTML = 'Update User';
    saveBtn.disabled = false;
  }
}

// Edit user
function editUser(userId) {
  const user = usersData.find(u => u.id === userId);
  if (user) {
    openUserModal(user);
  } else {
    console.error('User not found:', userId);
  }
}

// Confirm delete user
function confirmDeleteUser(userId) {
  userToDelete = userId;
  console.log('Confirming delete for user:', userId);
  deleteModal.style.display = "flex";
}

// Close delete modal
function closeDeleteModal() {
  deleteModal.style.display = "none";
  userToDelete = null;
}

// Delete user
async function deleteUser() {
  if (!userToDelete) {
    console.error('No user to delete');
    return;
  }
  
  try {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
    confirmBtn.disabled = true;
    
    console.log('Deleting user:', userToDelete);
    await deleteDoc(doc(db, "users", userToDelete));
    closeDeleteModal();
    await loadData(); // Reload data to reflect changes
    
    confirmBtn.innerHTML = originalText;
    confirmBtn.disabled = false;
    
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Error deleting user. Please try again.");
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.innerHTML = 'Delete';
    confirmBtn.disabled = false;
  }
}

// Update pagination controls
function updatePagination() {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  
  startIndex.textContent = Math.min((currentPage - 1) * rowsPerPage + 1, filteredData.length);
  endIndex.textContent = Math.min(currentPage * rowsPerPage, filteredData.length);
  totalRecords.textContent = filteredData.length;
  
  // Update pagination buttons
  firstPage.disabled = currentPage === 1;
  prevPage.disabled = currentPage === 1;
  nextPage.disabled = currentPage === totalPages || totalPages === 0;
  lastPage.disabled = currentPage === totalPages || totalPages === 0;
  
  // Update page number display
  updatePageNumberDisplay(totalPages);
}

// Update page number display
function updatePageNumberDisplay(totalPages) {
  const paginationControls = document.querySelector('.pagination-controls');
  const pageButtons = paginationControls.querySelectorAll('.pagination-btn:not(#firstPage):not(#prevPage):not(#nextPage):not(#lastPage)');
  
  // Remove existing page number buttons
  pageButtons.forEach(btn => btn.remove());
  
  if (totalPages > 0) {
    // Add current page button
    const currentBtn = document.createElement('button');
    currentBtn.className = 'pagination-btn active';
    currentBtn.textContent = currentPage;
    paginationControls.insertBefore(currentBtn, nextPage);
  }
}

// Update statistics
function updateStats() {
  totalCount.textContent = usersData.length;
  lastUpdated.textContent = new Date().toLocaleTimeString();
}

// Search functionality
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  
  if (searchTerm.trim() === '') {
    filteredData = [...usersData];
  } else {
    filteredData = usersData.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      (user.copy && user.copy.toLowerCase().includes(searchTerm)) ||
      (user.link && user.link.toLowerCase().includes(searchTerm))
    );
  }
  
  currentPage = 1;
  updateTable();
  updatePagination();
}

// Sort functionality
function handleSort(th) {
  const field = th.getAttribute('data-sort');
  
  // Toggle direction if same field
  if (currentSort.field === field) {
    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.field = field;
    currentSort.direction = 'asc';
  }
  
  // Sort data
  filteredData.sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    
    // Handle dates
    if (field === 'createdAt') {
      aVal = aVal.getTime();
      bVal = bVal.getTime();
    }
    
    // Handle strings
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    // Handle empty values
    if (!aVal && bVal) return currentSort.direction === 'asc' ? -1 : 1;
    if (aVal && !bVal) return currentSort.direction === 'asc' ? 1 : -1;
    if (!aVal && !bVal) return 0;
    
    if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Update sort indicators
  document.querySelectorAll('th i').forEach(icon => {
    icon.className = 'fas fa-sort';
  });
  
  const icon = th.querySelector('i');
  if (icon) {
    icon.className = currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }
  
  updateTable();
}

// Pagination functions
function goToFirstPage() {
  currentPage = 1;
  updateTable();
  updatePagination();
}

function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    updateTable();
    updatePagination();
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    updateTable();
    updatePagination();
  }
}

function goToLastPage() {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  currentPage = totalPages;
  updateTable();
  updatePagination();
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
