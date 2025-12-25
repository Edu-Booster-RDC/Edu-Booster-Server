const mongoose = require("mongoose");

const ProvinceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String, default: "DRC" },
    addedby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Province", ProvinceSchema);
