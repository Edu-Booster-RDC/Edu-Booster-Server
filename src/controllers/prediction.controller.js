const ExamPrediction = require("../models/prediction");
const CourseProgress = require("../models/progress");

const generatePrediction = async () => {
  try {
    const { courseId } = req.params;
    const userId = req.body;

    const progress = await CourseProgress.findOne({ userId, courseId });

    const probability = progress.score / 100;

    const verdict =
      probability > 0.7
        ? "likely_pass"
        : probability > 0.4
        ? "uncertain"
        : "likely_fail";

    await ExamPrediction.findOneAndUpdate(
      { userId },
      {
        probability,
        verdict,
        factors: {
          averageScore: `${progress.score}%`,
          consistency: progress.answeredQuestions > 10 ? "good" : "low",
          hardQuestionsAccuracy: "pending",
          helpUsageRate: "low",
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.log("Error while generating your exam prediction:", error);
    return next(
      new HttpError("Error while generating your exam prediction", 500)
    );
  }
};

module.exports = {
  generatePrediction,
};
