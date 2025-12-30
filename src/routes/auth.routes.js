const express = require("express");
const {
  createAccount,
  verifyEmail,
  newVerificationCode,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getCurrentUser,
  resetPasswordLoggedIn,
  requestEmailChange,
  confirmEmailChange,
} = require("../controllers/auth.controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/create", createAccount);
router.post("/verify-email", verifyEmail);
router.post("/new-email-verification-code", newVerificationCode);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/", resetPassword);
router.post("/refresh-token", refreshToken);

router.post("/logout", auth, logout);
router.get("/me", auth, getCurrentUser);
router.post("/reset-password-logged-in", auth, resetPasswordLoggedIn);

router.post("/request-email-change", auth, requestEmailChange);
router.post("/confirm-email-change", auth, confirmEmailChange);

module.exports = router;
