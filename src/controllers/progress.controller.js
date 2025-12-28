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

const getInProgress = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const inProgressCourses = await CourseProgress.find({
      userId,
      status: "in_progress",
    });

    res.status(200).json({
      success: true,
      progress: inProgressCourses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getProgress,
  getInProgress,
};
