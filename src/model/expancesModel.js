const mongoose = require("mongoose");

const Currency = {
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
  JPY: "JPY",
  AUD: "AUD",
  CAD: "CAD",
  CHF: "CHF",
  CNY: "CNY",
  INR: "INR",
  SGD: "SGD",
  // Add more currencies as needed
};
// Define schema
const expenseSchema = new mongoose.Schema(
  {
    ApprovedBy: {
      type: String,
      // required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    staffName: {
      type: String,
      required: true,
    },
    createdDate: {
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
      enum: Object.values(Currency),
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Credit Card", "Other"],
      required: true,
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
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
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
      required: true,
    },
    attachments: {
      type: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  { timestamps: true }
);

// Create model
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
