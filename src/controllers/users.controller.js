const User = require("../models/");
const HttpError = require("../models/error");
const connectDB = require("../config/db");
const { generateCode } = require("../utils/generatecode");
const generateExpiration = require("../utils/codeExpiration");
const sendSMS = require("../config/sms");

const updateUser = async (req, res, next) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return next(new HttpError("Utilisateur non authentifié", 401));
    }

    const { name } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();

    if (Object.keys(updates).length === 0) {
      return next(new HttpError("Aucune donnée valide à mettre à jour", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur introuvable", 404));
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    next(new HttpError("Échec de la mise à jour du profil", 500));
  }
};

const addPhoneNumber = async (req, res, next) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return next(new HttpError("Utilisateur non authentifié", 401));
    }

    const { phone } = req.body;
    if (!phone) {
      return next(new HttpError("Le numéro de téléphone est requis", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur introuvable", 404));
    }

    const { code } = generateCode();
    const expiresAt = generateExpiration(10);

    user.phone = phone;
    user.isPhoneVerified = false;
    user.phoneCode = code;
    user.phoneCodeExpiration = expiresAt;

    await user.save();

    await sendSMS({
      to: phone,
      text: `Votre code de vérification est : ${code}`,
    });

    res.status(200).json({
      message: "Code de vérification envoyé",
      phone: user.phone,
    });
  } catch (error) {
    console.error(error);
    next(new HttpError("Échec de l’ajout du numéro de téléphone", 500));
  }
};

const toggleUserActiveStatus = async (req, res, next) => {
  try {
    await connectDB();

    if (req.user?.role !== "admin") {
      return next(new HttpError("Accès refusé", 403));
    }

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur introuvable", 404));
    }

    user.isActive = !user.isActive;
    await user.save();

    if (user.isActive) {
      await sendAccountActivated(user.email, user.name);
    } else {
      await sendAccountDeactivated(user.email, user.name);
    }

    res.status(200).json({
      message: `Utilisateur ${
        user.isActive ? "activé" : "désactivé"
      } avec succès`,
      user: {
        id: user._id,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(error);
    next(
      new HttpError("Échec de la mise à jour du statut de l’utilisateur", 500)
    );
  }
};

module.exports = {
  updateUser,
  addPhoneNumber,
  toggleUserActiveStatus,
};
