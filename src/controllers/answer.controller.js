const Question = require("../models/question");
const UserAnswer = require("../models/userAnswer");
const QuestionAttempt = require("../models/questionAttempt");
const CourseProgress = require("../models/progress");
const HttpError = require("../models/error");

const answerQuestion = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { questionId } = req.params;
    const { answer, timeSpentSeconds } = req.body;

    const question = await Question.findById(questionId);
    if (!question) return next(new HttpError("Question introuvable", 404));

    const isCorrect = answer === question.correctAnswer;

    const existing = await UserAnswer.findOne({ userId, questionId });
    if (existing) {
      return next(new HttpError("Question déjà répondue", 409));
    }

    await UserAnswer.create({
      userId,
      courseId: question.course,
      questionId,
      userAnswer: answer,
      isCorrect,
      timeSpentSeconds,
    });

    const attempts = await QuestionAttempt.countDocuments({
      userId,
      questionId,
    });
    await QuestionAttempt.create({
      userId,
      questionId,
      attemptNumber: attempts + 1,
      answer,
      isCorrect,
    });

    const progress = await CourseProgress.findOne({
      userId,
      courseId: question.course,
    });

    progress.answeredQuestions += 1;
    if (isCorrect) progress.correctAnswers += 1;

    progress.score = Math.round(
      (progress.correctAnswers / progress.answeredQuestions) * 100
    );

    progress.lastActivityAt = new Date();
    await progress.save();

    res.json({
      correct: isCorrect,
      correctAnswer: isCorrect ? null : question.correctAnswer,
      explanation: question.explanation,
    });
  } catch (error) {
    console.log("Error while answering the question:", error);
    return next(new HttpError("Error while answering the question", 500));
  }
};

module.exports = {
  answerQuestion,
};
