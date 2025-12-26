const Section = require("../models/sections");
const User = require("../models/user");
const Province = require("../models/province");
const HttpError = require("../models/error");
const connectDB = require("../config/db");

const addSection = async (req, res, next) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    const { name } = req.body;
    const { provinceId } = req.params;

    if (!name || !provinceId) {
      return next(new HttpError("Veuillez remplir tous les champs", 422));
    }

    // Vérifier qu'il n'existe pas déjà une section avec le même nom dans la province
    const existingSection = await Section.findOne({
      name,
      province: provinceId,
    });
    if (existingSection) {
      return next(
        new HttpError(
          "Une section avec ce nom existe déjà dans cette province",
          422
        )
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur non trouvé", 404));
    }

    const province = await Province.findById(provinceId);
    if (!province) {
      return next(new HttpError("Province non trouvée", 404));
    }

    const section = new Section({
      name,
      addedby: user._id,
      province: province._id,
    });

    await section.save();

    res.status(201).json({
      success: true,
      message: "La section a été ajoutée avec succès",
      section,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la section", error);
    return next(new HttpError("Erreur lors de l'ajout de la section", 500));
  }
};

const getSections = async (req, res, next) => {
  try {
    await connectDB();

    const sections = await Section.find()
      .populate("province", "name")
      .populate("addedby", "name email");

    res.status(200).json({
      success: true,
      count: sections.length,
      sections,
    });
  } catch (error) {
    console.log("Error while getting sections", error);
    return next(new HttpError("Error while getting sections", 500));
  }
};

const getSectionById = async (req, res, next) => {
  try {
    await connectDB();

    const { id } = req.params;

    const section = await Section.findById(id)
      .populate("province", "name")
      .populate("addedby", "name email");

    if (!section) {
      return next(new HttpError("Section not found", 404));
    }

    res.status(200).json({
      success: true,
      section,
    });
  } catch (error) {
    console.log("Error while getting section", error);
    return next(new HttpError("Error while getting section", 500));
  }
};

const getSectionsByProvince = async (req, res, next) => {
  try {
    await connectDB();

    const { provinceId } = req.params;

    if (!provinceId) {
      return next(new HttpError("Province id is required", 400));
    }

    const sections = await Section.find({ province: provinceId })
      .populate("province", "name")
      .populate("addedby", "name");

    res.status(200).json({
      success: true,
      count: sections.length,
      sections,
    });
  } catch (error) {
    console.log("Error while getting sections by province", error);
    return next(new HttpError("Error while getting sections by province", 500));
  }
};

const updateSection = async (req, res, next) => {
  try {
    await connectDB();

    const { id } = req.params;
    const { name, provinceId } = req.body;

    const section = await Section.findById(id);
    if (!section) {
      return next(new HttpError("Section not found", 404));
    }

    if (name) section.name = name;
    if (provinceId) section.province = provinceId;

    await section.save();

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      section,
    });
  } catch (error) {
    console.log("Error while updating section", error);
    return next(new HttpError("Error while updating section", 500));
  }
};

const deleteSection = async (req, res, next) => {
  try {
    await connectDB();

    const { id } = req.params;

    const section = await Section.findById(id);
    if (!section) {
      return next(new HttpError("Section not found", 404));
    }

    await section.deleteOne();

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.log("Error while deleting section", error);
    return next(new HttpError("Error while deleting section", 500));
  }
};

module.exports = {
  addSection,
  getSections,
  getSectionById,
  getSectionsByProvince,
  updateSection,
  deleteSection,
};
