const connectDB = require("../config/db");
const HttpError = require("../models/error");
const CourseProgress = require("../models/progress");

const getProgress = async (req, res, next) => {
  try {
    await connectDB();
    const userId = req.user?.userId;
    const { courseId } = req.params;

    const progress = await CourseProgress.findOne({ userId, courseId });
    res.staus(200).json({ progress });
  } catch (error) {
    console.log("Error while getting the user progress:", error);
    return next(new HttpError("Error while getting the user progress", 500));
  }
};

const getInProgress = async (req, res, next) => {
  try {
    await connectDB();
    const userId = req.user?.id;

    const inProgressCourse = await CourseProgress.findOne({
      userId,
    });

    // if (!inProgressCourse) {
    //   return res.status(200).json({
    //     success: true,
    //     progress: null,
    //   });
    // }

    res.status(200).json({
      success: true,
      progress: inProgressCourse,
    });
  } catch (error) {
    console.error(error);
    return next(new HttpError("Erreur serveur", 500));
  }
};

module.exports = {
  getProgress,
  getInProgress,
};
