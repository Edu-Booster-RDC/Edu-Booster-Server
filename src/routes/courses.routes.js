const express = require("express");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const {
  addCourse,
  publishCourse,
  getCoursesBySection,
  getCoursesById,
  updateCourse,
  deleteCourse,
  getCourses,
} = require("../controllers/cour.controller");
const upload = require("../middlewares/uploadPdf");
const router = express.Router();

router.post(
  "/admin/courses",
  auth,
  role("admin"),
  upload.single("pdf"),
  addCourse
);
router.post("/admin/publish/:courseId", auth, role("admin"), publishCourse);
router.patch("/admin/update/:id", auth, role("admin"), updateCourse);
router.delete("/admin/delete/:courseId", auth, role("admin"), deleteCourse);
router.get("/admin/", auth, role("admin"), getCourses);
router.get("/sections/:sectionId", auth, getCoursesBySection);
router.get("/:id", auth, getCoursesById);

module.exports = router;
