const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";

    try {
        const response = await fetch("https://admin-dashboard-r7ur.onrender.com/", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Login failed";
            return;
        }

        // Save JWT token
        localStorage.setItem("token", data.token);

        // Save admin information
        localStorage.setItem(
            "admin",
            JSON.stringify(data.admin)
        );

        message.textContent = "Login successful!";

        // Go to dashboard
        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Login error:", error);

        message.textContent =
            "Unable to connect to server.";
    }
});