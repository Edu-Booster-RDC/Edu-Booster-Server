const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares/errorHandlers");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");

connectDB();

const app = express();
const port = process.env.PORT || 8080;

// middlewares
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "🚀 Server is running! Welcome to Edu-Booster API.",
  });
});

app.use("/api/auth", authRoutes);

// error handling
app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Dev server running on port ${port}`);
  });
}

module.exports = app;
