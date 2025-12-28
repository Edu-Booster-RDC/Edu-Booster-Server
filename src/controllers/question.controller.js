const Question = require("../models/question");
const UserAnswer = require("../models/userAnswer");
const HttpError = require("../models/error");
const connectDB = require("../config/db");

const getNextQuestion = async (req, res, next) => {
  try {
    await connectDB();
    const userId = req.user?.userId;
    const { courseId } = req.params;

    const answered = await UserAnswer.find({ userId, courseId }).select(
      "questionId"
    );
    const answeredIds = answered.map((a) => a.questionId);

    const question = await Question.findOne({
      course: courseId,
      _id: { $nin: answeredIds },
      isActive: true,
    }).select("-correctAnswer");

    if (!question) {
      return res.status(200).json({
        error: "finished",
        finished: true,
        message: "Vous avez terminé ce cours.",
      });
    }

    res.json({ question });
  } catch (error) {
    console.log("Error while getting the next question:", error);
    return next(new HttpError("Error while getting the next question", 500));
  }
};

module.exports = {
  getNextQuestion,
};
