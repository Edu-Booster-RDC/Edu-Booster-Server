const Subscription = require("../models/subscription");
const User = require("../models/user");
const HttpError = require("../models/error");
const connectDB = require("../config/db");
const bcrypt = require("bcryptjs");
const {
  sendSubscription,
  sendActivationKey,
  sendSubscriptionKey,
} = require("../services/sendMails");

const generateActivationKey = (userId) => {
  const prefix = "EDU-BOOSTER";

  const shortUserId = userId.toString().slice(-8).toUpperCase();

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}${mm}${dd}`;

  const randomStr = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}-${shortUserId}-${dateStr}-${randomStr}`;
};

const selectSubscription = async (req, res, next) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    const { plan } = req.body;

    if (!userId) {
      return next(new HttpError("Non autorisé", 401));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur non trouvé", 404));
    }

    const admin = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });

    if (!plan) {
      return next(new HttpError("Veuillez sélectionner un plan", 422));
    }

    const allowedPlans = Subscription.schema.path("plan").enumValues;

    if (!allowedPlans.includes(plan)) {
      return next(
        new HttpError(
          `Plan invalide. Plans autorisés : ${allowedPlans.join(", ")}`,
          422
        )
      );
    }

    const existingSubscription = await Subscription.findOne({ user: userId });
    if (existingSubscription) {
      return next(new HttpError("L'utilisateur a déjà une souscription", 409));
    }

    const activationKey = generateActivationKey(user.id);
    const activationKeyExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    const subscription = await Subscription.create({
      user: user.id,
      plan,
      isActive: false,
      activationKey: activationKey,
      activationKeyExpires,
    });

    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const formattedDate = `${day}/${month}/${year} => ${hours}:${minutes}`;

    await sendSubscription(
      admin.email,
      user.name,
      subscription.plan,
      subscription.activationKey,
      formattedDate
    );

    res.status(201).json({
      message: "Souscription créée avec succès",
      subscription: {
        plan: subscription.plan,
        id: subscription.id,
      },
    });
  } catch (error) {
    console.error(error);
    next(new HttpError("Échec de la souscription", 500));
  }
};

const sendKey = async (req, res, next) => {
  try {
    await connectDB();

    const userId = req.user?.userId;

    const admin = await User.findById(userId);
    if (!admin) {
      return next(new HttpError("Non autorisé", 404));
    }

    if (admin.role !== "admin") {
      return next(
        new HttpError("Seul l'admin peut effectuer cette action", 403)
      );
    }

    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new HttpError("Utilisateur non trouvé", 404));
    }

    const subscription = await Subscription.findOne({ user: user._id });
    if (!subscription) {
      return next(
        new HttpError("Aucune souscription pour cet utilisateur", 404)
      );
    }

    if (subscription.keySent) {
      return next(new HttpError("La clé a déjà été envoyée", 409));
    }

    const date = subscription.activationKeyExpires;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const formattedDate = `${day}/${month}/${year} => ${hours}:${minutes}`;

    await sendActivationKey(
      user.email,
      user.name,
      subscription.activationKey,
      formattedDate
    );

    subscription.keySent = true;
    await subscription.save();

    res.status(200).json({
      message: `Clé d'activation envoyée avec succès à ${user.email}`,
    });
  } catch (error) {
    console.error(error);
    next(new HttpError("Échec de l'envoi de la clé d'activation", 500));
  }
};

const activateKey = async (req, res, next) => {
  try {
    await connectDB();
    const { key } = req.params;
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur non trouvé", 404));
    }

    const subscription = await Subscription.findOne({ activationKey: key });
    if (!subscription) {
      return next(new HttpError("Clé d'activation invalide", 404));
    }

    const now = new Date();
    if (subscription.activationKeyExpires < now) {
      return res.status(400).json({
        error: "expiré",
        message: "La clé d'activation a expiré",
        id: subscription.id,
      });
    }

    subscription.activationKey = undefined;
    subscription.activationKeyExpires = undefined;
    subscription.isActive = true;

    await subscription.save();

    user.subscription = subscription.id;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Votre souscription a commencé, vous pouvez maintenant utiliser tous nos services",
    });
  } catch (error) {
    console.error(error);
    next(new HttpError("Échec de l'activation de la souscription", 500));
  }
};

const newKey = async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur non trouvé", 404));
    }

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return next(new HttpError("Souscription non trouvée", 404));
    }

    const admin = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });

    const activationKey = generateActivationKey(user.id);
    const activationKeyExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    subscription.activationKey = activationKey;
    subscription.activationKeyExpires = activationKeyExpires;
    subscription.isActive = false;
    subscription.keySent = false;

    await subscription.save();

    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const formattedDate = `${day}/${month}/${year} => ${hours}:${minutes}`;

    await sendSubscriptionKey(
      admin.email,
      user.name,
      subscription.plan,
      subscription.activationKey,
      formattedDate
    );

    res.status(201).json({
      message:
        "Nouvelle clé d'activation demandée, vous recevrez un email bientôt",
      subscription: {
        plan: subscription.plan,
        activationKey,
        activationKeyExpires,
      },
    });
  } catch (error) {
    console.error(error);
    next(new HttpError("Échec de la demande de nouvelle clé", 500));
  }
};

const getUserSubscription = async (req, res, next) => {
  try {
    await connectDB();
    const userId = req.user?.userId;

    if (!userId) {
      return next(new HttpError("Non autorisé", 401));
    }

    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      return next(
        new HttpError("Aucune souscription trouvée pour cet utilisateur", 404)
      );
    }

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error(error);
    next(new HttpError("Impossible de récupérer la souscription", 500));
  }
};

const getAllSubscriptions = async (req, res, next) => {
  try {
    await connectDB();
    const userId = req.user?.userId;
    const admin = await User.findById(userId);

    if (!admin || admin.role !== "admin") {
      return next(
        new HttpError("Seul l'admin peut voir toutes les souscriptions", 403)
      );
    }

    const subscriptions = await Subscription.find().populate(
      "user",
      "name email"
    );

    res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error(error);
    next(new HttpError("Impossible de récupérer les souscriptions", 500));
  }
};

const cancelSubscription = async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const userId = req.user?.userId;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return next(new HttpError("Souscription non trouvée", 404));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur non trouvé", 404));
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (subscription.user.toString() !== userId && user.role !== "admin") {
      return next(new HttpError("Action non autorisée", 403));
    }

    // Supprimer la référence de souscription dans l'utilisateur
    const subscriptionOwner = await User.findById(subscription.user);
    if (subscriptionOwner) {
      subscriptionOwner.subscription = undefined;
      await subscriptionOwner.save();
    }

    // Supprimer la souscription
    await subscription.deleteOne();

    res.status(200).json({
      success: true,
      message: "Souscription annulée avec succès",
    });
  } catch (error) {
    console.error(error);
    next(new HttpError("Impossible d'annuler la souscription", 500));
  }
};

const renewSubscription = async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("Utilisateur non trouvé", 404));
    }

    const admin = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return next(new HttpError("Souscription non trouvée", 404));
    }

    const newActivationKey = generateActivationKey(subscription.user);
    const activationKeyExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    subscription.activationKey = newActivationKey;
    subscription.activationKeyExpires = activationKeyExpires;
    subscription.isActive = false;
    subscription.keySent = false;

    await subscription.save();

    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const formattedDate = `${day}/${month}/${year} => ${hours}:${minutes}`;

    await sendSubscription(
      admin.email,
      user.name,
      subscription.plan,
      subscription.activationKey,
      formattedDate
    );

    res.status(200).json({
      success: true,
      message: "Souscription renouvelée, nouvelle clé d'activation générée",
      subscription,
    });
  } catch (error) {
    console.error(error);
    next(new HttpError("Impossible de renouveler la souscription", 500));
  }
};

module.exports = {
  selectSubscription,
  sendKey,
  activateKey,
  newKey,
  getUserSubscription,
  getAllSubscriptions,
  cancelSubscription,
  renewSubscription,
};
