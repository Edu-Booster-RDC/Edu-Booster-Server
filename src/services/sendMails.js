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

module.exports = {
  sendCode,
  sendNewCode,
  sendResetPasswordLink,
  sendPasswordReseted,
  sendAccountActivated,
  sendAccountDeactivated,
};
