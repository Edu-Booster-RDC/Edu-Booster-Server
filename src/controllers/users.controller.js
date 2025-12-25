const User = require("../models/user");
const HttpError = require("../models/error");
const connectDB = require("../config/db");
const Province = require("../models/province");
const { generateCode } = require("../utils/generatecode");
const generateExpiration = require("../utils/codeExpiration");
const sendSMS = require("../config/sms");
const {
  sendAccountActivated,
  sendAccountDeactivated,
} = require("../services/sendMails");

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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l’utilisateur :", error);
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

const verifyPhoneNumber = async (req, res, next) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    const { code } = req.body;

    if (!code) {
      return next(new HttpError("Le code de vérification est requis", 422));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur introuvable", 404));
    }

    if (user.phoneCode !== code) {
      return next(new HttpError("Code de vérification invalide", 422));
    }

    const now = new Date();
    if (user.phoneCodeExpiration < now) {
      return res.status(400).json({
        error: "expired",
        message: "Le code de vérification a expiré",
        phone: user.phone,
      });
    }

    user.phoneCode = undefined;
    user.phoneCodeExpiration = undefined;
    user.isPhoneVerified = true;

    await user.save();

    res.status(200).json({
      message: "Votre numéro de téléphone est maintenant vérifié",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Verify phone error:", error);
    next(
      new HttpError(
        "Erreur lors de la vérification du numéro de téléphone",
        500
      )
    );
  }
};

const newPhoneCode = async (req, res, next) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return next(new HttpError("Utilisateur non authentifié", 401));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur introuvable", 404));
    }

    const { code } = generateCode();
    const expiresAt = generateExpiration(10);

    user.phoneCode = code;
    user.phoneCodeExpiration = expiresAt;
    user.isPhoneVerified = false;

    await user.save();

    await sendSMS({
      to: user.phone,
      text: `Votre code de vérification est : ${code}`,
    });

    res.status(200).json({
      message: `Code de vérification envoyé au numéro ${user.phone}`,
      phone: user.phone,
    });
  } catch (error) {
    console.error(error);
    next(
      new HttpError(
        "Échec de la demande d’un nouveau code de vérification du numéro de téléphone",
        500
      )
    );
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

const getUsers = async (req, res, next) => {
  try {
    await connectDB();

    if (req.user?.role !== "admin") {
      return next(new HttpError("Accès refusé", 403));
    }

    const loggedInUserId = req.user.userId;

    const users = await User.find({
      _id: { $ne: loggedInUserId },
    }).select(
      `
      -password
      -phoneCode
      -phoneCodeExpiration
      -emailCode
      -emailCodeExpiration
      -pendingEmail
      -pendingEmailCode
      -pendingEmailCodeExpiration
      -resetPasswordToken
      -resetPasswordTokenExpiration
      -refreshToken
      `
    );

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(error);

    return next(
      new HttpError("Échec de la récupération des utilisateurs", 500)
    );
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return next(new HttpError("Utilisateur introuvable", 404));
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    return next(
      new HttpError("Échec de la récupération de l’utilisateur", 500)
    );
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await connectDB();

    if (req.user?.role !== "admin") {
      return next(new HttpError("Accès refusé", 403));
    }

    const { userId } = req.params;

    if (userId === req.user.userId) {
      new HttpError("Vous ne pouvez pas supprimer votre propre compte", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur introuvable", 404));
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    console.error(error);
    return next(new HttpError("Échec de la suppression de l’utilisateur", 500));
  }
};

const selectProvince = async (req, res, next) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return next(new HttpError("Utilisateur non authentifié.", 401));
    }

    const { provinceId } = req.params;
    if (!provinceId) {
      return next(new HttpError("Aucun ID de province fourni.", 400));
    }

    const province = await Province.findById(provinceId);
    if (!province) {
      return next(new HttpError("Province sélectionnée introuvable.", 404));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(
        new HttpError("Utilisateur introuvable ou non authentifié.", 404)
      );
    }

    user.province = province.id;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Province sélectionnée avec succès.",
      province: {
        id: province.id,
        name: province.name,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la sélection de la province :", error);
    return next(
      new HttpError(
        "Une erreur est survenue lors de la sélection de la province.",
        500
      )
    );
  }
};

module.exports = {
  updateUser,
  addPhoneNumber,
  toggleUserActiveStatus,
  verifyPhoneNumber,
  newPhoneCode,
  getUsers,
  getUserById,
  deleteUser,
  selectProvince,
};
