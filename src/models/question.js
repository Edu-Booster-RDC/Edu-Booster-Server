const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }, // 🔥 AJOUT
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    weight: Number,
    explanation: String,
    topic: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
