const { codeBlock } = require("@discordjs/builders");
const config = require("../config");
const moment = require("moment");
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const port = 3000;

// Dummy user data for demonstration purposes
const users = [
  { id: 1, username: "admin", password: "admin" },
  // Add more users as needed
];

// Middleware to check if the user is authenticated
const authenticate = (req, res, next) => {
  // For simplicity, let's assume authentication is based on a session cookie
  const isAuthenticated = req.cookies.authenticated === "true";

  if (isAuthenticated) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Express middleware for parsing JSON and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "dashboard")));

// Login route
app.get("/login", (req, res) => {
  const loginFilePath = path.join(__dirname, "..", "dashboard", "login.html");
  res.sendFile(loginFilePath);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check credentials against the dummy user data
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (user) {
    // Simulate a successful login by setting a session cookie
    res.cookie("authenticated", "true");
    res.redirect("/dashboard"); // Redirect to the dashboard after successful login
  } else {
    res.send("Invalid credentials");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  // Clear the session cookie to log out
  res.clearCookie("authenticated");
  res.redirect("/login");
});

// Dashboard route
app.get("/dashboard", authenticate, (req, res) => {
  const dashboardFilePath = path.join(
    __dirname,
    "..",
    "dashboard",
    "dashboard.html",
  );
  res.sendFile(dashboardFilePath);
});

// Route to handle bot status toggle
app.post("/dashboard/toggleBotStatus", authenticate, (req, res) => {
  // Perform actions to toggle bot status
  // This is just a placeholder, replace it with your actual bot logic
  const currentStatus = req.cookies.botStatus || "Offline";
  const newStatus = currentStatus === "Online" ? "Offline" : "Online";
  res.cookie("botStatus", newStatus);
  res.json({ success: true, newStatus });
});

app.listen(port, () => {
  console.log(
    `\x1b[0m`,
    `\x1b[33m 〢`,
    `\x1b[33m ${moment(Date.now()).format("LT")}`,
    `\x1b[31m Uptime connection`,
    `\x1b[32m LOADED`,
  );
});
