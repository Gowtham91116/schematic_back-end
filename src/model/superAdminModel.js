const mongoose = require("mongoose");

const superAdminModel = new mongoose.Schema({
  Super_Admin_id: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    unique: true,
    type: String,
    required: true,
  },
  contact: {
    type: String,
    // required: true,
  },
  designation: {
    type: String,
    required: true,
    default: "superAdmin",
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
    default: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "role", // Reference to the role model
  },
  password: {
    type: String,
    // required: true,
  },
});

module.exports = mongoose.model("super-admin", superAdminModel);
