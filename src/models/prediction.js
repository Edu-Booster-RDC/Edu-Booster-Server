const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    probability: {
      type: Number,
    },

    verdict: {
      type: String,
      enum: ["likely_pass", "uncertain", "likely_fail"],
    },

    factors: {
      averageScore: String,
      consistency: String,
      hardQuestionsAccuracy: String,
      helpUsageRate: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ExamPrediction", predictionSchema);
