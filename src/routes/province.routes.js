const express = require("express");
const auth = require("../middlewares/auth");
const {
  addProvince,
  getProvinceById,
  updateProvince,
  deleteProvince,
  getProvinces,
} = require("../controllers/province.controller");
const role = require("../middlewares/role");
const router = express.Router();

router.post("/", auth, role("admin"), addProvince);
router.get("/", getProvinces);
router.get("/:id", getProvinceById);
router.put("/:id", auth, role("admin"), updateProvince);
router.delete("/:id", auth, role("admin"), deleteProvince);

module.exports = router;
