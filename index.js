const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const morgan = require("morgan");
const connectToMongoDB = require("./config/db");
const path = require("path");
const rfs = require("rotating-file-stream");
const { format } = require("date-fns");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectToMongoDB();

// Middleware setup
app.use(express.json());
app.use(cors());

// Morgan setup for logging
const logDirectory = path.join(__dirname, "log");
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: logDirectory,
});

// Define a custom token for morgan to display time in Indian Standard Time (IST)
morgan.token("indian-time", () => {
  return format(new Date(), "YYYY-MM-dd HH:mm:ss", {
    timeZone: "Asia/Kolkata",
  });
});

// Define a custom token for the browser information
morgan.token("browser", (req, res) => {
  return req.headers["user-agent"]; // Extract the user agent from the request headers
});

// Setup morgan with custom format including Indian time and browser information
app.use(
  morgan(
    ':remote-addr - - [:indian-time] ":method :url HTTP/:http-version" :status :res[content-length] "-" ":browser"',
    { stream: accessLogStream }
  )
);

// Routes setup
require("./src/router/baseRouter")(app);

module.exports = app;
