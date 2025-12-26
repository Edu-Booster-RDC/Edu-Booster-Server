const HttpError = require("../models/error");
const CourseProgress = require("../models/progress");

const getProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.params;

    const progress = await CourseProgress.findOne({ userId, courseId });
    res.staus(200).json({ progress });
  } catch (error) {
    console.log("Error while getting the user progress:", error);
    return next(new HttpError("Error while getting the user progress", 500));
  }
};

module.exports = {
  getProgress,
};
