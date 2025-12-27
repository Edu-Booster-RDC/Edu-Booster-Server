const path = require("path");
const fs = require("fs");
const Course = require("../models/course");
const HttpError = require("../models/error");
const User = require("../models/user");
const Section = require("../models/sections");
const { uploadPdfToCloudinary } = require("../services/cloudinary.service");
const connectDB = require("../config/db");
const Question = require("../models/question");
const { generateQuestionsFromPdf } = require("../services/gemini.service");
const mongoose = require("mongoose");
const CourseProgress = require("../models/progress");

function generateRichTextPreview(questions) {
  let html = `<h2>Aperçu des questions</h2>`;
  questions.forEach((q, index) => {
    html += `<div style="margin-bottom: 20px;">`;
    html += `<strong>Q${index + 1}: ${q.questionText}</strong><br/>`;
    html += `<ul>`;
    q.options.forEach((opt) => {
      const correctMark = opt === q.correctAnswer ? "✅" : "";
      html += `<li>${opt} ${correctMark}</li>`;
    });
    html += `</ul>`;
    html += `<em>Difficulté: ${q.difficulty || "N/A"}</em><br/>`;
    if (q.explanation) html += `<p>Explication: ${q.explanation}</p>`;
    if (q.topic) html += `<p>Sujet: ${q.topic}</p>`;
    html += `</div>`;
  });
  return html;
}

const addCourse = async (req, res, next) => {
  try {
    // 1️⃣ Connect to DB
    await connectDB();

    const { title, description, sections } = req.body;
    const pdf = req.file;
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur non authentifié", 404));
    }

    // 2️⃣ Parse sections (Postman may send a JSON string)
    let parsedSections = [];
    try {
      parsedSections = Array.isArray(sections)
        ? sections
        : JSON.parse(sections);
    } catch (err) {
      return next(new HttpError("Les sections doivent être un tableau", 422));
    }

    // 3️⃣ Required fields check
    if (!title || !description) {
      return next(new HttpError("Le titre et la description sont requis", 422));
    }

    if (!parsedSections || parsedSections.length === 0) {
      return next(
        new HttpError("Veuillez sélectionner au moins une section", 422)
      );
    }

    if (!pdf) {
      return next(
        new HttpError("Veuillez sélectionner un fichier PDF pour le cours", 422)
      );
    }

    // 4️⃣ Verify sections exist
    const foundSections = await Section.find({ _id: { $in: parsedSections } });
    if (foundSections.length !== parsedSections.length) {
      return next(new HttpError("Section(s) invalide(s) sélectionnée(s)", 404));
    }

    // 5️⃣ Check course uniqueness
    const existingCourse = await Course.findOne({
      title,
      sections: { $in: parsedSections },
    });
    if (existingCourse) {
      return next(
        new HttpError(
          "Le cours existe déjà dans une des sections sélectionnées",
          422
        )
      );
    }

    // 6️⃣ Upload PDF to Cloudinary
    const uploadResult = await uploadPdfToCloudinary(
      pdf.buffer,
      `course-${Date.now()}`
    );

    // 7️⃣ Create the course
    const course = await Course.create({
      title,
      description,
      sections: parsedSections,
      sourcePdfUrl: uploadResult.secure_url,
      createdBy: user.id,
      status: "draft",
    });

    await Section.updateMany(
      { _id: { $in: parsedSections } },
      { $addToSet: { courses: course._id } }
    );

    // =========================
    // 🤖 Generate questions via AI
    // =========================

    // Use Vercel-compatible temp folder
    const tempDir = "/tmp";
    const tempPdfPath = path.join(tempDir, `${course._id}-${Date.now()}.pdf`);
    fs.writeFileSync(tempPdfPath, pdf.buffer);

    // Call AI service
    const aiResult = await generateQuestionsFromPdf(tempPdfPath);

    // Verify AI response
    if (!aiResult?.questions || !Array.isArray(aiResult.questions)) {
      fs.unlinkSync(tempPdfPath);
      throw new Error("Format de réponse IA invalide");
    }

    // Prepare questions for DB
    const questionsToSave = aiResult.questions.map((q) => ({
      course: course._id,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      explanation: q.explanation,
      topic: q.topic,
    }));

    // Generate rich text preview
    const richTextPreview = generateRichTextPreview(aiResult.questions);

    // Save questions
    const savedQuestions = await Question.insertMany(questionsToSave);

    // Update course with preview & question count
    course.questionsPreviewText = richTextPreview;
    course.totalQuestions = questionsToSave.length;
    await course.save();

    // Delete temporary PDF
    fs.unlinkSync(tempPdfPath);

    // 12️⃣ Respond to client
    res.status(201).json({
      success: true,
      course,
      questionsCreated: savedQuestions.length,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du cours:", error);
    return next(new HttpError(error.message || "Erreur serveur", 500));
  }
};

const publishCourse = async (req, res, next) => {
  try {
    await connectDB();

    const { courseId } = req.params;
    const userId = req.user?.userId;

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new HttpError("Cours introuvable", 404));
    }

    if (course.createdBy.toString() !== userId && req.user?.role !== "admin") {
      return next(
        new HttpError("Vous n'êtes pas autorisé à publier ce cours", 403)
      );
    }

    if (!course.totalQuestions || course.totalQuestions === 0) {
      return next(new HttpError("Le cours ne contient pas de questions", 400));
    }

    course.status = "published";
    course.publishedAt = new Date();
    await course.save();

    res.status(200).json({
      success: true,
      message: "Le cours a été publié avec succès",
      course,
    });
  } catch (error) {
    console.error("Erreur lors de la publication du cours:", error);
    return next(new HttpError(error.message || "Erreur serveur", 500));
  }
};

const getCourses = async (req, res, next) => {
  try {
    await connectDB();

    const courses = await Course.find();

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Erreur lors lors de la recupration cours:", error);
    return next(new HttpError("Erreur lors lors de la recupration cours"));
  }
};

const getCoursesBySection = async (req, res, next) => {
  try {
    await connectDB();

    const { sectionId } = req.params;

    if (!sectionId) {
      return next(new HttpError("L’identifiant de la section est requis", 422));
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return next(new HttpError("Section introuvable", 404));
    }

    const courses = await Course.find({
      sections: sectionId,
    })
      .populate("sections", "name")
      .sort({ publishedAt: -1 });

    res.status(200).json({
      success: true,
      section: {
        id: section._id,
        name: section.name,
      },
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des cours par section :",
      error
    );
    return next(
      new HttpError("Erreur lors de la récupération des cours par section", 500)
    );
  }
};

const getCoursesById = async (req, res, next) => {
  try {
    await connectDB();

    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return next(new HttpError("Cours introuvable", 404));
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du cours :", error);
    return next(new HttpError("Erreur lors de la récupération du cours", 500));
  }
};

const updateCourse = async (req, res, next) => {
  try {
    await connectDB();

    const { id } = req.params;
    const { title, description } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return next(new HttpError("Cours introuvable", 404));
    }

    course.title = title;
    course.description = description;

    await course.save();

    res.status(200).json({
      success: true,
      message: "Le cours a été mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la modification du cours :", error);
    return next(new HttpError("Erreur lors de la modification du cours", 500));
  }
};

const deleteCourse = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    const { courseId } = req.params;

    if (!courseId) {
      return next(new HttpError("L'identifiant du cours est requis", 422));
    }

    // ✅ Vérifier l’existence du cours
    const course = await Course.findById(courseId).session(session);
    if (!course) {
      return next(new HttpError("Cours introuvable", 404));
    }

    // Supprimer les questions liées
    await Question.deleteMany({ course: courseId }, { session });

    // 🗑 Supprimer le cours
    await Course.findByIdAndDelete(courseId, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message:
        "Le cours et les questions associées ont été supprimés avec succès",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Erreur lors de la suppression du cours :", error);
    return next(new HttpError("Erreur lors de la suppression du cours", 500));
  }
};

const startCourse = async (req, res, next) => {
  try {
    await connectDB();
    const userId = req.user.userId;
    const { courseId } = req.params;

    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = await CourseProgress.create({
        userId,
        courseId,
        status: "in_progress",
        startedAt: new Date(),
        lastActivityAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });
    }

    res.json({ success: true, progress });
  } catch (error) {
    console.log("Error while trying to start a course:", error);
    return next(new HttpError("Error while trying to start a course", 500));
  }
};

module.exports = {
  addCourse,
  publishCourse,
  getCourses,
  getCoursesBySection,
  getCoursesById,
  updateCourse,
  deleteCourse,
  startCourse,
};
