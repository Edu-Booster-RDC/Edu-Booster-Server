const {
  getProgress,
  getInProgress,
  getFinshedCourses,
  getFinshedCourses2,
} = require("../controllers/progress.controller");
const auth = require("../middlewares/auth");

const router = require("express").Router();

router.get("/", auth, getProgress);
router.get("/in-progress", auth, getInProgress);
router.get("/finished", auth, getFinshedCourses);
router.get("/finished-2", auth, getFinshedCourses2);

module.exports = router;
