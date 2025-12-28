const HttpError = require("../models/error");
const ExamPrediction = require("../models/prediction");
const CourseProgress = require("../models/progress");

const generatePrediction = async (req, res, next) => {
  try {
    await connectDB();
    const { courseId } = req.params;
    const userId = req.user?.userId;

    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      return res
        .status(404)
        .json({ success: false, message: "Course progress not found" });
    }

    const probability = progress.score / 100;

    const verdict =
      probability > 0.7
        ? "likely_pass"
        : probability > 0.4
        ? "uncertain"
        : "likely_fail";

    const prediction = await ExamPrediction.findOneAndUpdate(
      { userId, courseId },
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
      { upsert: true, new: true } // return the updated doc
    );

    res.status(200).json({ success: true, prediction });
  } catch (error) {
    console.log("Error while generating prediction:", error);
    return next(new HttpError("Error while generating prediction", 500));
  }
};

module.exports = {
  generatePrediction,
};
