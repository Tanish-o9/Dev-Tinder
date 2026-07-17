const mongoose = require("mongoose");
const connectDB = async () => {
  const retryDelay = 5000;
  while (true) {
    try {
      await mongoose.connect(process.env.DB_CONNECTION_SECRET, {
        serverSelectionTimeoutMS: 10000,
      });
      return;
    } catch (error) {
      console.error(`Database connection failed. Retrying in ${retryDelay / 1000}s: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};
module.exports = connectDB;
