const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  superAdminId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  roleName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  workReport: {
    type: {
      create: {
        type: Boolean,
        default: false, // Set default value if needed
      },
      approval: {
        type: Boolean,
        default: false, // Set default value if needed
      },
      update: {
        type: Boolean,
        default: false, // Set default value if needed
      },
      delete: {
        type: Boolean,
        default: false, // Set default value if needed
      },
    },
  },
  expances: {
    type: {
      create: {
        type: Boolean,
        default: false,
      },
      approval: {
        type: Boolean,
        default: false,
      },
      update: {
        type: Boolean,
        default: false,
      },
      delete: {
        type: Boolean,
        default: false,
      },
    },
  },
});

module.exports = mongoose.model("roles", roleSchema);
