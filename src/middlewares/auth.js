const jwt = require("jsonwebtoken");
const HttpError = require("../models/error");

const auth = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return next(new HttpError("Authentification requise.", 401));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return next(new HttpError("Session expirée ou invalide.", 401));
  }
};

module.exports = auth;
