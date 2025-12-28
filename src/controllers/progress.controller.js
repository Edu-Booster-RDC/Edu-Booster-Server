const connectDB = require("../config/db");
const HttpError = require("../models/error");
const CourseProgress = require("../models/progress");
const mongoose = require("mongoose");

const getProgress = async (req, res) => {
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

    const userId = req.user?.userId;

    const inProgressCourse = await CourseProgress.findOne({
      userId,
      status: "in_progress",
    });

    res.status(200).json({
      success: true,
      progress: inProgressCourse,
    });
  } catch (error) {
    console.error(error);
    return next(new HttpError("Erreur serveur", 500));
  }
};

const getFinshedCourses = async (req, res, next) => {
  try {
    await connectDB();

    const userId = req.user?.userId;

    const completedCourses = await CourseProgress.find({
      userId,
      status: "completed",
    });

    res.status(200).json({
      success: true,
      complete: completedCourses,
    });
  } catch (error) {}
};

module.exports = {
  getProgress,
  getInProgress,
  getFinshedCourses,
};
