const HttpError = require("../models/error");

const role = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new HttpError("Accès refusé.", 403));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new HttpError(
          "Vous n'avez pas la permission d'accéder à cette ressource.",
          403
        )
      );
    }

    next();
  };
};

module.exports = role;
