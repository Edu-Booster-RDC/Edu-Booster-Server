const Province = require("../models/province");
const User = require("../models/user");
const HttpError = require("../models/error");
const connectDB = require("../config/db");

const addProvince = async (req, res, next) => {
  try {
    await connectDB();
    const userId = req.user?.userId;
    const { name, country } = req.body;

    if (!name || !country) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    const province = new Province({
      name,
      country,
      addedby: user._id,
    });

    await province.save();

    res.status(201).json({
      success: true,
      message: "Province ajoutée avec succès",
      province: {
        id: province._id,
        name: province.name,
        country: province.country,
      },
    });
  } catch (error) {
    console.error("Error in add province:", error);
    return next(
      new HttpError(
        "Une erreur est survenue lors de l'ajout de la province",
        500
      )
    );
  }
};

const getProvinces = async (req, res, next) => {
  try {
    await connectDB();
    const provinces = await Province.find();

    res.status(200).json({
      success: true,
      count: provinces.length,
      provinces,
    });
  } catch (error) {
    console.error("Error in get provinces:", error);
    return next(
      new HttpError(
        "Une erreur est survenue lors de la récupération des provinces",
        500
      )
    );
  }
};

const getProvinceById = async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;

    const province = await Province.findById(id);
    if (!province) {
      return next(new HttpError("Province not found", 404));
    }

    res.status(200).json({
      success: true,
      province,
    });
  } catch (error) {
    console.error("Error in get province:", error);
    return next(
      new HttpError(
        "Une erreur est survenue lors de la récupération de la province",
        500
      )
    );
  }
};

// Update a province
const updateProvince = async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { name, country } = req.body;

    const province = await Province.findById(id);
    if (!province) {
      return next(new HttpError("Province not found", 404));
    }

    if (name) province.name = name;
    if (country) province.country = country;

    await province.save();

    res.status(200).json({
      success: true,
      message: "Province mise à jour avec succès",
      province,
    });
  } catch (error) {
    console.error("Error in update province:", error);
    return next(
      new HttpError(
        "Une erreur est survenue lors de la mise à jour de la province",
        500
      )
    );
  }
};

// Delete a province
const deleteProvince = async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;

    const province = await Province.findById(id);
    if (!province) {
      return next(new HttpError("Province not found", 404));
    }

    await province.remove();

    res.status(200).json({
      success: true,
      message: "Province supprimée avec succès",
    });
  } catch (error) {
    console.error("Error in delete province:", error);
    return next(
      new HttpError(
        "Une erreur est survenue lors de la suppression de la province",
        500
      )
    );
  }
};

module.exports = {
  addProvince,
  getProvinces,
  getProvinceById,
  updateProvince,
  deleteProvince,
};
