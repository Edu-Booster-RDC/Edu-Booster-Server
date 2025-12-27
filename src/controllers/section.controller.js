const Section = require("../models/sections");
const User = require("../models/user");
const Province = require("../models/province");
const HttpError = require("../models/error");
const connectDB = require("../config/db");

const addSection = async (req, res, next) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    const { name, provinces } = req.body;

    if (!name || !provinces || !Array.isArray(provinces)) {
      return next(
        new HttpError("Veuillez fournir le nom et les provinces", 422)
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur non trouvé", 404));
    }

    // Vérifier que toutes les provinces existent
    const foundProvinces = await Province.find({
      _id: { $in: provinces },
    });

    if (foundProvinces.length !== provinces.length) {
      return next(
        new HttpError("Une ou plusieurs provinces sont invalides", 404)
      );
    }

    // Chercher une section existante par nom
    let section = await Section.findOne({ name });

    if (section) {
      // Ajouter uniquement les nouvelles provinces
      const newProvinces = provinces.filter(
        (p) => !section.provinces.includes(p)
      );

      section.provinces.push(...newProvinces);
      await section.save();

      return res.status(200).json({
        success: true,
        message: "Province(s) ajoutée(s) à la section existante",
        section,
      });
    }

    // Sinon créer une nouvelle section
    section = new Section({
      name,
      addedby: user._id,
      provinces,
    });

    await section.save();

    res.status(201).json({
      success: true,
      message: "Section créée avec succès",
      section,
    });
  } catch (error) {
    console.error(error);
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
