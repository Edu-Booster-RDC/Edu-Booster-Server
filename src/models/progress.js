const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "expired"],
      default: "not_started",
    },
    startedAt: Date,
    lastActivityAt: Date,
    completedAt: Date,
    expiresAt: Date,
    answeredQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    allquestions: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("CourseProgress", progressSchema);
