const express = require("express");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const {
  updateUser,
  addPhoneNumber,
  toggleUserActiveStatus,
  verifyPhoneNumber,
  newPhoneCode,
} = require("../controllers/users.controller");
const router = express.Router();

router.patch("/me", auth, updateUser);
router.patch("/me/phone", auth, addPhoneNumber);
router.post("/me/verify-phone", auth, verifyPhoneNumber);
router.post("/me/new-phone-code", auth, newPhoneCode);

// admin user routes
router.patch(
  "/admin/users/:userId/toggle-active",
  auth,
  role("admin"),
  toggleUserActiveStatus
);

module.exports = router;
