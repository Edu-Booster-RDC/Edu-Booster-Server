const { transporter } = require("../config/mailer");
const verificationCodeTemplate = require("../templates/sendVerificationCode");

const sendCode = async (to, code, name) => {
  await transporter.sendMail({
    from: `"EduBooster Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Code de vérification de votre compte",
    html: verificationCodeTemplate(code, name),
  });
};

module.exports = {
  sendCode,
};
