const mongoose = require("mongoose");

const userAnswerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    userAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    timeSpentSeconds: Number,
    answeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userAnswerSchema.index({ userId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model("UserAnswer", userAnswerSchema);
