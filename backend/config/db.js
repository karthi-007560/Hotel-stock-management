
const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from .env");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "hotelstock"
  });

  console.log("MongoDB connected successfully");
  console.log("Database:", mongoose.connection.name);
  console.log("Users collection:", mongoose.connection.collection("users").collectionName);
}

module.exports = connectDB;
