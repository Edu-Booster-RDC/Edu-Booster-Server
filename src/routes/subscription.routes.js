const express = require("express");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const {
  selectSubscription,
  getUserSubscription,
  activateKey,
  newKey,
  cancelSubscription,
  renewSubscription,
  sendKey,
  getAllSubscriptions,
  deleteSubscription,
} = require("../controllers/subscription.controller");
const router = express.Router();

// ==============================
// Routes utilisateur
// ==============================

router.post("/", auth, selectSubscription);

router.get("/me", auth, getUserSubscription);

router.post("/activate/:key", auth, activateKey);

router.post("/newkey/:id", auth, newKey);

router.delete("/cancel/:id", auth, cancelSubscription);

router.post("/renew/:id", auth, renewSubscription);

// ==============================
// Routes admin
// ==============================

router.post("/sendkey/:email", auth, role("admin"), sendKey);
router.get("/all", auth, role("admin"), getAllSubscriptions);
router.delete("/delete/:id", auth, role("admin"), deleteSubscription);

module.exports = router;
