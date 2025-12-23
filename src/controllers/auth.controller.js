const User = require("../models/user");
const HttpError = require("../models/error");
const bcrypt = require("bcryptjs");
const generateExpiration = require("../utils/codeExpiration");
const { generateCode } = require("../utils/generatecode");
const { sendCode, sendNewCode } = require("../services/sendMails");
const connectDB = require("../config/db");
const jwt = require("jsonwebtoken");

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

const login = async (req, res, next) => {
  try {
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
      },
    });
  } catch (error) {
    console.error(error);
    next(new HttpError("Échec de la connexion", 500));
  }
};

const refreshToken = async (req, res, next) => {
  try {
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

module.exports = {
  createAccount,
  verifyEmail,
  newVerificationCode,
  login,
  refreshToken,
  logout,
};
