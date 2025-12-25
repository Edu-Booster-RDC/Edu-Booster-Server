require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares/errorHandlers");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");

const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:19006",
  "https://edubooster.org",
  "https://accounts.edubooster.org",
  "exp://*",
];

const app = express();
const port = process.env.PORT || 8080;

// middlewares
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("CORS - Origin:", origin);

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || origin.startsWith("exp://")) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "🚀 Server is running! Welcome to Edu-Booster API.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

// error handling
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected, starting server...");

    if (process.env.NODE_ENV !== "production") {
      app.listen(port, () => {
        console.log(`Dev server running on port ${port}`);
      });
    }
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
