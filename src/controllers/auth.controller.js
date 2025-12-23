const User = require("../models/user");
const HttpError = require("../models/error");
const bcrypt = require("bcryptjs");
const generateExpiration = require("../utils/codeExpiration");
const { generateCode } = require("../utils/generatecode");
const {
  sendCode,
  sendNewCode,
  sendResetPasswordLink,
} = require("../services/sendMails");
const connectDB = require("../config/db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function generateRandomToken(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

const compareToken = async (token, hashedToken) => {
  return await bcrypt.compare(token, hashedToken);
};

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
        email: user.email,
      });
    }

    user.emailCode = undefined;
    user.emailCodeExpiration = undefined;
    user.isEmailVerified = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Votre adresse email a été vérifiée avec succès",
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
    user.isEmailVerified = false;
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

const login = async (req, res, next) => {
  try {
    await connectDB();

    const { email, password, stayLoggedIn } = req.body;

    if (!email || !password) {
      return next(new HttpError("Identifiants invalides", 422));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new HttpError("Email ou mot de passe invalide", 401));
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "compte_desactive",
        message: "Votre compte est désactivé. Contactez le support.",
        email: user.email,
        support: process.env.EMAIL_USER,
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        error: "email_non_verifie",
        message: "Veuillez vérifier votre email pour continuer.",
        email: user.email,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new HttpError("Email ou mot de passe invalide", 401));
    }

    const payload = { userId: user._id, role: user.role };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: stayLoggedIn ? "30d" : "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: stayLoggedIn ? "30d" : "7d",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: stayLoggedIn ? 30 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: stayLoggedIn ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    });

    user.refreshToken = refreshToken;
    await user.save();

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
    next(new HttpError("Échec de la connexion", 500));
  }
};

const refreshToken = async (req, res, next) => {
  try {
    await connectDB();
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return next(new HttpError("Aucun token de rafraîchissement trouvé", 401));
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return next(new HttpError("Token invalide", 403));
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || decoded.userId !== user._id.toString()) {
          return next(new HttpError("Token expiré ou invalide", 403));
        }

        const payload = { userId: user._id, role: user.role };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "15m",
        });

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({
          success: true,
          message: "Token rafraîchi avec succès",
        });
      }
    );
  } catch (error) {
    console.error(error);
    next(new HttpError("Impossible de rafraîchir le token", 500));
  }
};

const logout = async (req, res, next) => {
  try {
    await connectDB();
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(200).json({ success: true, message: "Déconnecté" });
    }

    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({ success: true, message: "Déconnecté avec succès" });
  } catch (error) {
    console.error(error);
    next(new HttpError("Impossible de se déconnecter", 500));
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    await connectDB();
    const { email } = req.body;
    if (!email) {
      return next(new HttpError("L'adresse e-mail est requise", 422));
    }

    const newEmail = email.toLowerCase();
    const user = await User.findOne({ email: newEmail });
    if (!user) {
      return next(new HttpError("Adresse e-mail invalide", 404));
    }

    const resetToken = generateRandomToken(32);
    const saltRounds = 10;
    const hashedToken = await bcrypt.hash(resetToken, saltRounds);
    const expiration = generateExpiration(5);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiration;
    await user.save();

    const resetUrl = `${
      process.env.CLIENT_URL
    }/auth/reset-password?token=${resetToken}&id=${
      user._id
    }&email=${encodeURIComponent(user.email)}`;

    await sendResetPasswordLink(user.email, resetUrl, user.name);

    res.status(200).json({
      success: true,
      message: `Un lien de réinitialisation du mot de passe a été envoyé à ${user.email}`,
    });
  } catch (error) {
    console.error(error);
    next(
      new HttpError(
        "Une erreur est survenue lors de l'envoi du mail de réinitialisation",
        500
      )
    );
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await connectDB();
    const { token, password, password2 } = req.body;
    const { id } = req.params;

    if (!password || !password2) {
      return next(new HttpError("Les mots de passe sont requis", 422));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new HttpError("Utilisateur introuvable", 404));
    }

    if (!user.resetPasswordToken || !user.resetPasswordTokenExpiration) {
      return next(new HttpError("Token de réinitialisation introuvable", 400));
    }

    const now = new Date();
    if (user.resetPasswordTokenExpiration < now) {
      return res.status(400).json({
        error: "expired",
        message: "Le token a expiré, veuillez en demander un nouveau",
        email: user.email,
      });
    }

    const isValidToken = await compareToken(token, user.resetPasswordToken);
    if (!isValidToken) {
      return next(new HttpError("Token de réinitialisation invalide", 400));
    }

    if (password !== password2) {
      return next(new HttpError("Les mots de passe ne correspondent pas", 422));
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPass = await bcrypt.hash(password, salt);

    user.password = hashedPass;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiration = undefined;

    user.refreshToken = null;

    await user.save();

    await sendPasswordReseted(user.email, user.name);

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message:
        "Le mot de passe a été réinitialisé. Vous avez été déconnecté de tous les appareils.",
    });
  } catch (error) {
    console.error(error);
    next(
      new HttpError(
        "Une erreur est survenue lors de la réinitialisation du mot de passe",
        500
      )
    );
  }
};

const resetPasswordLoggedIn = async (req, res, next) => {
  try {
    await connectDB();

    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    const userId = req.user._id; // set by auth middleware

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return next(new HttpError("Tous les champs sont requis", 422));
    }

    if (newPassword !== newPasswordConfirm) {
      return next(
        new HttpError("Les nouveaux mots de passe ne correspondent pas", 422)
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur introuvable", 404));
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(new HttpError("Le mot de passe actuel est incorrect", 401));
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;

    user.refreshToken = null;

    await user.save();

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message:
        "Votre mot de passe a été mis à jour avec succès. Vous avez été déconnecté de tous les autres appareils.",
    });
  } catch (error) {
    console.error(error);
    next(
      new HttpError(
        "Une erreur est survenue lors de la mise à jour du mot de passe",
        500
      )
    );
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return next(new HttpError("Utilisateur non authentifié", 401));
    }

    const user = await User.findById(userId).select(
      "-password -refreshToken -resetPasswordToken -resetPasswordTokenExpiration"
    );
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
    next(
      new HttpError(
        "Impossible de récupérer les informations de l'utilisateur",
        500
      )
    );
  }
};

const requestEmailChange = async (req, res, next) => {
  try {
    await connectDB();

    const userId = req.user?.userId; // set by auth middleware
    const { newEmail } = req.body;

    if (!userId) {
      return next(new HttpError("Utilisateur non authentifié", 401));
    }

    if (!newEmail) {
      return next(new HttpError("Le nouvel email est requis", 422));
    }

    const normalizedEmail = newEmail.toLowerCase();

    // Check if the new email is already in use
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new HttpError("Cet email est déjà utilisé", 422));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur introuvable", 404));
    }

    const { code } = generateCode();
    const expiresAt = generateExpiration(10);

    // Store the new email and verification code temporarily
    user.pendingEmail = normalizedEmail;
    user.pendingEmailCode = code;
    user.pendingEmailCodeExpiration = expiresAt;

    await user.save();

    await sendNewCode(normalizedEmail, code, user.name);

    res.status(200).json({
      success: true,
      message: `Un code de vérification a été envoyé à ${normalizedEmail}`,
    });
  } catch (error) {
    console.error("Error in requestEmailChange:", error);
    next(
      new HttpError(
        "Une erreur est survenue lors de la demande de changement d'email",
        500
      )
    );
  }
};

const confirmEmailChange = async (req, res, next) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    const { code } = req.body;

    if (!userId) {
      return next(new HttpError("Utilisateur non authentifié", 401));
    }

    if (!code) {
      return next(new HttpError("Le code de vérification est requis", 422));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur introuvable", 404));
    }

    if (
      !user.pendingEmail ||
      !user.pendingEmailCode ||
      !user.pendingEmailCodeExpiration
    ) {
      return next(
        new HttpError("Aucune demande de changement d'email trouvée", 400)
      );
    }

    const now = new Date();
    if (user.pendingEmailCodeExpiration < now) {
      return res.status(400).json({
        error: "expired",
        message: "Le code de vérification a expiré",
        email: user.pendingEmail,
      });
    }

    if (user.pendingEmailCode !== code) {
      return next(new HttpError("Code de vérification invalide", 400));
    }

    // Update the email
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.pendingEmailCode = undefined;
    user.pendingEmailCodeExpiration = undefined;
    user.isEmailVerified = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Votre adresse email a été mise à jour avec succès",
      email: user.email,
    });
  } catch (error) {
    console.error("Error in confirmEmailChange:", error);
    next(
      new HttpError(
        "Une erreur est survenue lors de la confirmation du changement d'email",
        500
      )
    );
  }
};

module.exports = {
  createAccount,
  verifyEmail,
  newVerificationCode,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  resetPasswordLoggedIn,
  requestEmailChange,
  confirmEmailChange,
};
