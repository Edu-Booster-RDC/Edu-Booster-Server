const Question = require("../models/question");
const UserAnswer = require("../models/userAnswer");
const HttpError = require("../models/error");
const connectDB = require("../config/db");

const getNextQuestion = async (req, res, next) => {
  try {
    await connectDB();
    const userId = req.user?.userId;
    const { courseId } = req.params;

    // Find questions already answered by this user for this course
    const answered = await UserAnswer.find({ userId, courseId }).select(
      "questionId"
    );
    const answeredIds = answered.map((a) => a.questionId);

    // Find next active question not yet answered
    const question = await Question.findOne({
      course: courseId,
      _id: { $nin: answeredIds },
      isActive: true,
    }).select("-correctAnswer");

    // If no question left, return finished
    if (!question) {
      return res.status(200).json({
        finished: true,
        message: "Vous avez terminé ce cours.",
      });
    }

    // Return next question
    res.json({ question, finished: false });
  } catch (error) {
    console.log("Error while getting the next question:", error);
    return next(new HttpError("Error while getting the next question", 500));
  }
};

module.exports = {
  getNextQuestion,
};
