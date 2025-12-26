const express = require("express");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const {
  updateUser,
  addPhoneNumber,
  toggleUserActiveStatus,
  verifyPhoneNumber,
  newPhoneCode,
  getUsers,
  getUserById,
  deleteUser,
  selectProvince,
  selectSection,
} = require("../controllers/users.controller");
const router = express.Router();

router.patch("/me", auth, updateUser);
router.patch("/me/phone", auth, addPhoneNumber);
router.post("/me/verify-phone", auth, verifyPhoneNumber);
router.post("/me/new-phone-code", auth, newPhoneCode);
router.get("/me/:id", getUserById);
router.post("/me/select-province/:provinceId", auth, selectProvince);
router.post("/me/select-section/:sectionId", auth, selectSection);

// admin user routes
router.patch(
  "/admin/users/:userId/toggle-active",
  auth,
  role("admin"),
  toggleUserActiveStatus
);
router.get("/admin/users/find", auth, role("admin"), getUsers);
router.delete("/admin/users/delete/:userId", auth, role("admin"), deleteUser);

module.exports = router;
