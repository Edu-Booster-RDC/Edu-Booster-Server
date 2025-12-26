const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cours",
        default: [],
      },
    ],
    addedby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    province: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Province",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Section", sectionSchema);
