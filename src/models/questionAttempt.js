const mongoose = require("mongoose");

const questionAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    attemptNumber: {
      type: Number,
    },
    answer: {
      type: String,
      default: "",
    },
    isCorrect: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QuestionAttempt", questionAttemptSchema);
