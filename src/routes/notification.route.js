const router = require("express").Router();
const { answerQuestion } = require("../controllers/answer.controller");
const { getNotifications } = require("../controllers/notification.controller");
const auth = require("../middlewares/auth");

router.get("/", auth, getNotifications);

module.exports = router;
