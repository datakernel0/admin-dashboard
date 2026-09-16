const API_URL = "https://admin-dashboard-r7ur.onrender.com";

const token = localStorage.getItem("token");
const admin = JSON.parse(localStorage.getItem("admin") || "null");

// Check if admin is logged in
if (!token || !admin) {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    window.location.href = "login.html";
}

// Show admin name
if (admin) {
    document.getElementById("adminName").textContent = admin.username;
}

// Load users
async function loadUsers(search = "") {
    try {
        let url = `${API_URL}/api/users`;

        if (search) {
            url += `?search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("admin");
                window.location.href = "login.html";
                return;
            }

            alert(data.message || "Failed to load users");
            return;
        }

        displayUsers(data.users);

    } catch (error) {
        console.error("Load users error:", error);
        alert("Unable to connect to server.");
    }
}

// Display users in table
function displayUsers(users) {
    const tableBody = document.getElementById("usersTableBody");

    tableBody.innerHTML = "";

    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("activeRecords").textContent = users.length;

    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No users found
                </td>
            </tr>
        `;
        return;
    }

    users.forEach(user => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${user.id}</td>

            <td>
                <div class="user-cell">
                    <div class="user-avatar">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>${user.name}</span>
                </div>
            </td>

            <td>${user.email}</td>
            <td>${user.phone || "-"}</td>
            <td>${user.role || "User"}</td>

            <td class="action-buttons">
                <button
                    class="view-btn"
                    onclick="viewUser(${user.id})"
                >
                    View
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteUser(${user.id}, '${user.name.replace(/'/g, "\\'")}')"
                >
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Search button
document.getElementById("searchBtn").addEventListener("click", () => {
    const search = document
        .getElementById("searchInput")
        .value
        .trim();

    loadUsers(search);
});

// Search with Enter key
document.getElementById("searchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
        const search = event.target.value.trim();
        loadUsers(search);
    }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");

    window.location.href = "login.html";
});

// Initial load
loadUsers();

// View single user
async function viewUser(userId) {
    try {
        const response = await fetch(
            `${API_URL}/api/users/${userId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to load user");
            return;
        }

        const user = data.user;
        const userDetails = document.getElementById("userDetails");

        userDetails.innerHTML = `
            <h2>Selected User</h2>

            <div class="details-grid">

                <div>
                    <strong>ID</strong>
                    <p>${user.id}</p>
                </div>

                <div>
                    <strong>Name</strong>
                    <p>${user.name}</p>
                </div>

                <div>
                    <strong>Email</strong>
                    <p>${user.email}</p>
                </div>

                <div>
                    <strong>Phone</strong>
                    <p>${user.phone || "-"}</p>
                </div>

                <div>
                    <strong>Address</strong>
                    <p>${user.address || "-"}</p>
                </div>

                <div>
                    <strong>Role</strong>
                    <p>${user.role || "User"}</p>
                </div>

                <div>
                    <strong>Created At</strong>
                    <p>${user.created_at}</p>
                </div>

            </div>
        `;

        userDetails.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {
        console.error("View user error:", error);
        alert("Unable to connect to server.");
    }
}

// Add User Modal
const addUserModal = document.getElementById("addUserModal");
const addUserBtn = document.getElementById("addUserBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const addUserForm = document.getElementById("addUserForm");
const addUserMessage = document.getElementById("addUserMessage");

// Open modal
addUserBtn.addEventListener("click", () => {
    addUserModal.style.display = "flex";
    addUserMessage.textContent = "";
});

// Close modal
closeModalBtn.addEventListener("click", () => {
    addUserModal.style.display = "none";
    addUserForm.reset();
});

// Close modal by clicking outside
addUserModal.addEventListener("click", event => {
    if (event.target === addUserModal) {
        addUserModal.style.display = "none";
        addUserForm.reset();
    }
});

// Add user
addUserForm.addEventListener("submit", async event => {
    event.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    const phone = document.getElementById("userPhone").value.trim();
    const address = document.getElementById("userAddress").value.trim();
    const role = document.getElementById("userRole").value;

    addUserMessage.textContent = "Adding user...";

    try {
        const response = await fetch(
            `${API_URL}/api/users`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    address,
                    role
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            addUserMessage.textContent =
                data.message || "Failed to add user";
            return;
        }

        addUserMessage.textContent = "User added successfully!";

        addUserForm.reset();

        await loadUsers();

        setTimeout(() => {
            addUserModal.style.display = "none";
            addUserMessage.textContent = "";
        }, 800);

    } catch (error) {
        console.error("Add user error:", error);

        addUserMessage.textContent =
            "Unable to connect to server.";
    }
});

// Delete user
async function deleteUser(userId, userName) {
    const confirmed = confirm(
        `Are you sure you want to delete "${userName}"?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/users/${userId}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to delete user");
            return;
        }

        alert("User deleted successfully!");

        await loadUsers();

        document.getElementById("userDetails").innerHTML = `
            <h2>Selected User</h2>
            <p>Select a user from the table to view details.</p>
        `;

    } catch (error) {
        console.error("Delete user error:", error);
        alert("Unable to connect to server.");
    }
}