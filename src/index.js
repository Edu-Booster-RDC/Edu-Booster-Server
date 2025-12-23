const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares/errorHandlers");
require("dotenv").config();
const { connect } = require("mongoose");

const app = express();
const port = process.env.PORT || 8080;

// middlewares
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

// error handling
app.use(notFound);
app.use(errorHandler);

connect(process.env.MONGO_URI)
  .then(
    app.listen(port, () =>
      console.log(`Server running on port: ${port}, and the db is connected`)
    )
  )
  .catch((error) => {
    console.log(error);
  });
