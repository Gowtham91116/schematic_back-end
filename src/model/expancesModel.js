const mongoose = require("mongoose");

const expanceSchema = new mongoose.Schema({
  Expance_id: {
    type: String,
    required: true,
    unque: true,
  },
  expanceType: {
    type: String,
    enum: ["travel", "food", "health", "others"],
  },
  expanceCost: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
  },
  isActive: {
    type: Boolean,
    required:true
  },
});

module.exports = mongoose.model("expances", expanceSchema);
