const { transporter } = require("../config/mailer");
const {
  verificationCodeTemplate,
  newVerificationCodeTemplate,
} = require("../templates/sendVerificationCode");
const {
  resetPasswordLink,
  passwordReseted,
} = require("../templates/resetPassword");
const {
  sendActivateAccountEmail,
  sendDisactivateAccountEmail,
} = require("../templates/isActive");
const {
  sendNewSubscriptionToAdmin,
  activationKeEmail,
  sendNewSubscriptionKeyToAdmin,
} = require("../templates/subscriptio");

const sendCode = async (to, code, name) => {
  await transporter.sendMail({
    from: `"EduBooster Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Code de vérification de votre compte",
    html: verificationCodeTemplate(code, name),
  });
};

const sendNewCode = async (to, code, name) => {
  await transporter.sendMail({
    from: `"EduBooster Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Nouveau code de vérification.",
    html: newVerificationCodeTemplate(code, name),
  });
};

const sendResetPasswordLink = async (to, resetUrl, name) => {
  await transporter.sendMail({
    from: `"EduBooster Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Mot de passe oublié",
    html: resetPasswordLink(resetUrl, name),
  });
};

const sendPasswordReseted = async (to, name) => {
  await transporter.sendMail({
    from: `"EduBooster Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Mot de passe réinitialisé",
    html: passwordReseted(name),
  });
};

const sendAccountActivated = async (to, name) => {
  await transporter.sendMail({
    from: `"EduBooster Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Votre compte a été activé",
    html: sendActivateAccountEmail(name),
  });
};

const sendAccountDeactivated = async (to, name) => {
  await transporter.sendMail({
    from: `"EduBooster Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Votre compte a été désactivé",
    html: sendDisactivateAccountEmail(name),
  });
};

const sendSubscription = async (to, userName, plan, key, date) => {
  await transporter.sendMail({
    from: `"EduBooster Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Nouvelle souscription",
    html: sendNewSubscriptionToAdmin(userName, plan, key, date),
  });
};
const sendActivationKey = async (to, userName, key, date) => {
  await transporter.sendMail({
    from: `"EduBooster Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Activation de votre compte",
    html: activationKeEmail(userName, key, date),
  });
};

const sendSubscriptionKey = async (userName, plan, key, date) => {
  await transporter.sendMail({
    from: `"EduBooster Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Nouvelle demande de clé d'activation",
    html: sendNewSubscriptionKeyToAdmin(userName, plan, key, date),
  });
};

module.exports = {
  sendCode,
  sendNewCode,
  sendResetPasswordLink,
  sendPasswordReseted,
  sendAccountActivated,
  sendAccountDeactivated,
  sendSubscription,
  sendActivationKey,
  sendSubscriptionKey
};
