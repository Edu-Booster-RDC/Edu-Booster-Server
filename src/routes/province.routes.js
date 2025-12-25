const express = require("express");
const auth = require("../middlewares/auth");
const {
  addProvince,
  getProvinceById,
  updateProvince,
  deleteProvince,
  getProvinces,
} = require("../controllers/province.controller");
const router = express.Router();

router.post("/", auth, addProvince);
router.get("/", getProvinces);
router.get("/:id", getProvinceById);
router.put("/:id", auth, updateProvince);
router.delete("/:id", auth, deleteProvince);

module.exports = router;
