const router = require("express").Router();
const { answerQuestion } = require("../controllers/answer.controller");
const auth = require("../middlewares/auth");

router.post("/:questionId/answer", auth, answerQuestion);

module.exports = router;
