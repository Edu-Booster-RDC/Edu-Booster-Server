const {
  getProgress,
  getInProgress,
  getFinshedCourses,
} = require("../controllers/progress.controller");
const auth = require("../middlewares/auth");

const router = require("express").Router();

router.get("/", auth, getProgress);
router.get("/in-progress", auth, getInProgress);
router.get("/finished", auth, getFinshedCourses);

module.exports = router;
