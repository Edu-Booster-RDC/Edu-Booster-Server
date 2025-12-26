const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // ou flash pour tests
  generationConfig: {
    responseMimeType: "application/json",
  },
});

module.exports = model;
