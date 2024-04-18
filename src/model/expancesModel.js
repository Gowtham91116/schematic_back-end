const mongoose = require("mongoose");
// Define schema
const expenseSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  ApprovedBy: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Credit Card", "Other"],
  },
  receiptNumber: {
    type: String,
    required: true,
  },
  approvalDate: {
    type: Date,
  },
  approvalStatus: {
    type: String,
    enum: ["Approved", "Pending", "Rejected"],
    default: "Pending",
  },
  category: {
    type: String,
    enum: [
      "Travel",
      "Meals and Entertainment",
      "Accommodation",
      "Transportation",
      "Miscellaneous",
    ],
  },
  notes: {
    type: String,
  },
  attachments: [
    {
      type: String, // Assuming attachment URLs
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive:{
    type:Boolean,
    required:true
  }
});

// Update timestamps
expenseSchema.set("timestamps", true);

// Create model
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
