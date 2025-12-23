const User = require("../models/user");
const HttpError = require("../models/error");
const bcrypt = require("bcryptjs");
const generateExpiration = require("../utils/codeExpiration");
const { generateCode } = require("../utils/generatecode");
const { sendCode, sendNewCode } = require("../services/sendMails");
const connectDB = require("../config/db");

const createAccount = async (req, res, next) => {
  try {
    await connectDB();

    const { name, email, role, password, password2 } = req.body;

    if (!name || !email || !role || !password || !password2) {
      return next(new HttpError("Veuillez remplir tous les champs", 422));
    }

    const newEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return next(new HttpError("Cet email est déjà utilisé", 422));
    }

    if (password !== password2) {
      return next(new HttpError("Les mots de passe ne correspondent pas", 422));
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPass = await bcrypt.hash(password, salt);

    const { code } = generateCode();
    const expiresAt = generateExpiration(10);

    const user = new User({
      name,
      email: newEmail,
      role,
      password: hashedPass,
      emailCode: code,
      emailCodeExpiration: expiresAt,
    });

    await user.save();
    await sendCode(user.email, code, user.name);

    res.status(201).json({
      success: true,
      message: `Un code de vérification a été envoyé à ${user.email}`,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in create account:", error);
    return next(
      new HttpError(
        "Une erreur est survenue lors de la création du compte",
        500
      )
    );
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    await connectDB();

    const { code } = req.body;

    if (!code) {
      return next(new HttpError("Le code de vérification sont requis", 422));
    }

    const user = await User.findOne({ emailCode: code });
    if (!user) {
      return next(new HttpError("Utilisateur introuvable", 404));
    }

    const now = new Date();
    if (user.emailCodeExpiration < now) {
      return res.status(400).json({
        error: "expired",
        message: "Le code de vérification a expiré",
      });
    }

    user.emailCode = undefined;
    user.emailCodeExpiration = undefined;
    user.isEmailVerified = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Votre adresse email a été vérifiée avec succès",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in verify email:", error);
    return next(
      new HttpError(
        "Une erreur est survenue lors de la vérification de l'email",
        500
      )
    );
  }
};

const newVerificationCode = async (req, res, next) => {
  try {
    await connectDB();

    const { email } = req.body;
    if (!email) {
      return next(new HttpError("L'email est requis", 422));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new HttpError("Email invalide", 404));
    }

    const { code } = generateCode();
    const expiresAt = generateExpiration(10);

    user.emailCode = code;
    user.emailCodeExpiration = expiresAt;
    await user.save();

    await sendNewCode(user.email, code, user.name);

    res.status(200).json({
      success: true,
      message: `Un nouveau code de vérification a été envoyé à ${user.email}`,
    });
  } catch (error) {
    console.error("Error in send new verification code:", error);
    return next(new HttpError("Erreur lors de l'envoi du nouveau code", 500));
  }
};

module.exports = {
  createAccount,
  verifyEmail,
  newVerificationCode,
};
