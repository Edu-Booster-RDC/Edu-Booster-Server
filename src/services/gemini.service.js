const fs = require("fs");
const model = require("../config/gemini");

async function generateQuestionsFromPdf(pdfPath) {
  const pdfData = fs.readFileSync(pdfPath);

  const result = await model.generateContent([
    {
      inlineData: {
        data: pdfData.toString("base64"),
        mimeType: "application/pdf",
      },
    },
    {
      text: `
Analyse ce PDF et retourne UNIQUEMENT un JSON valide avec cette structure :

{
  "questions": [
    {
      "questionText": "",
      "options": ["", "", ""],
      "correctAnswer": "",
      "difficulty": "easy | medium | hard",
      "explanation": "",
      "topic": ""
    }
  ]
}

INSTRUCTIONS IMPORTANTES :
- Le PDF contient plusieurs questions avec leurs options
- LES RÉPONSES CORRECTES SE TROUVENT APRÈS LA DERNIÈRE QUESTION DU DOCUMENT
- Cette partie finale correspond au corrigé (answer key)
- Tu dois associer chaque question à sa bonne réponse à partir de ce corrigé

RÈGLES STRICTES :
- correctAnswer DOIT être exactement une valeur présente dans options
- N’invente PAS de réponses
- Si une réponse correcte est introuvable, ignore la question
- Pas de texte hors JSON
- Pas de markdown
- Pas de commentaires
`,
    },
  ]);

  return JSON.parse(result.response.text());
}

module.exports = { generateQuestionsFromPdf };
