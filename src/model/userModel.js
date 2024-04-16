const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  Staff_id: {
    type: String,
    required: true,
    unque: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    unique:true,
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("user", adminSchema);
