const { generatePrediction } = require("../controllers/prediction.controller");
const auth = require("../middlewares/auth");

const router = require("express").Router();

router.get("/generate", auth, generatePrediction);

module.exports = router;
