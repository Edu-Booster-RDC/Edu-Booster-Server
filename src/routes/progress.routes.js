const { getProgress } = require("../controllers/progress.controller");
const auth = require("../middlewares/auth");

const router = require("express").Router();

router.get("/:courseId", auth, getProgress);

module.exports = router;
