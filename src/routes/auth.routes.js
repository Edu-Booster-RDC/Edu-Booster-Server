const express = require("express");
const {
  createAccount,
  verifyEmail,
  newVerificationCode,
} = require("../controllers/user.controller");

const router = express.Router();

router.post("/create", createAccount);
router.post("/verify-email", verifyEmail);
router.post("/new-email-verification-code", newVerificationCode);

module.exports = router;
