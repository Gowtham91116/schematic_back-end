const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

async function connectToMongoDB() {
  try {
    const mongodbUri = process.env.MONGODB_URI;
    await mongoose.connect(mongodbUri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = connectToMongoDB;
