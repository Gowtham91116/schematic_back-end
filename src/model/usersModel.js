const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    default: "user",
  },
  profilePic: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    required: true,
  },
  googleId: {
    type: String,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false,
  },
  password: {
    type: String,
  },
});

module.exports = mongoose.model("users", userSchema);
