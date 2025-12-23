const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  try {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGO_URI, {
        bufferCommands: false,
      });
    }

    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected");

    return cached.conn;
  } catch (error) {
    cached.promise = null;

    console.error("❌ MongoDB connection error:", error.message);

    if (process.env.NODE_ENV !== "production") {
      throw error;
    }
  }
}

module.exports = connectDB;
