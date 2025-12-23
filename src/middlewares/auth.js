const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        return next(new HttpError("Non authentifié", 401));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return next(new HttpError("Accès refusé", 403));
      }

      next();
    } catch (error) {
      console.error(error);
      return next(new HttpError("Token invalide ou expiré", 401));
    }
  };
};

module.exports = auth;
