const connectDB = require("../config/db");
const HttpError = require("../models/error");
const Notification = require("../models/notification");

exports.sendNotification = async ({ userId, type, title, body }) => {
  await Notification.create({
    userId,
    type,
    title,
    body,
  });
};

exports.getMyNotifications = async (req, res) => {
  const userId = req.user.userId;
  const notifications = await Notification.find({ userId }).sort("-createdAt");
  res.json({ notifications });
};

const getNotifications = async (req, res, next) => {
  try {
    await connectDB();

    const adminNotifications = await Notification.find().populate(
      "userId",
      "name"
    );

    res.status(200).json({
      success: true,
      count: adminNotifications.length,
      adminNotifications,
    });
  } catch (error) {
    console.error(err);
    next(
      new HttpError(
        "Impossible de récupérer les informations de l'utilisateur",
        500
      )
    );
  }
};

module.exports = {
  getNotifications,
};
