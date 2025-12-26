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
