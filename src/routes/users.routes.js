const express = require("express");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const {
  updateUser,
  addPhoneNumber,
  toggleUserActiveStatus,
} = require("../controllers/users.controller");
const router = express.Router();

router.patch("/me", auth, updateUser);
router.patch("/me/phone", auth, addPhoneNumber);

router.patch(
  "/admin/users/:userId/toggle-active",
  auth,
  role("admin"),
  toggleUserActiveStatus
);

module.exports = router;
