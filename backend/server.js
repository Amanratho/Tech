// require("dotenv").config();
const dotenv = require("dotenv");
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes.js");
const machineRoutes = require("./routes/machineRoutes");
const machineShowRoute = require("./routes/machineShowRoute");
const rentalRoutes = require("./routes/RentalRoutes.js");
const bodyParser = require("body-parser");
const otpRoutes = require("./routes/otpRoutes.js");
// const mongoose = require("mongoose");
const path = require("path");
// const multer = require("multer");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes.js");
const maintenanceRoutes = require("./routes/machineMaintenanceRoutes.js");
const { keepAlive } = require("./keep.js");

const app = express();

dotenv.config();

app.use(cors());
app.use(bodyParser.json());

app.get("/ping", (req, res) => {
  res.send("Server is active!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", authRoutes);

app.get("/", (req, res) => {
  res.send("API is running....");
});
app.use("/api/users", userRoutes);
app.use("/api/machine/", machineRoutes);
app.use("/api", machineShowRoute);
app.use("/api/rentals", rentalRoutes);
app.use("/api", rentalRoutes);
app.use("/api", maintenanceRoutes);
app.use("/api/otp", otpRoutes);

// Connect to MongoDB and start the server
connectDB();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  keepAlive();
});
