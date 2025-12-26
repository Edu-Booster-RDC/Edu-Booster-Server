const express = require("express");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const router = express.Router();

router.post("/province/:provinceId", auth, role("admin"), addSection);
router.get("/", getSections);
router.get("/province/:provinceId", getSectionsByProvince);
router.get("/:id", getSectionById);
router.patch("/:id", auth, role("admin"), updateSection);
router.delete("/:id", auth, role("admin"), deleteSection);

module.exports = router;
