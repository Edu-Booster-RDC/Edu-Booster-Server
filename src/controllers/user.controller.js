const User = require("../models/user");
const HttpError = require("../models/error");
const bcrypt = require("bcryptjs");
const generateExpiration = require("../utils/codeExpiration");
const { generateCode } = require("../utils/generatecode");
const { sendCode } = require("../services/sendMails");
const connectDB = require("../config/db");

const createAccount = async (req, res, next) => {
  try {
    await connectDB();

    const { name, email, role, password, password2 } = req.body;
    if (!name || !email || !role || !password || !password2) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const newEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return next(new HttpError("The email is already used", 422));
    }

    if (password != password2) {
      return next(new HttpError("The passwords do not match", 422));
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPass = await bcrypt.hash(password, salt);

    const { hash, code } = generateCode();
    const expiresAt = generateExpiration(10);

    const user = new User({
      name,
      email: newEmail,
      role,
      password: hashedPass,
      emailCode: hash,
      emailCodeExpiration: expiresAt,
    });

    await user.save();

    await sendCode(user.email, code, user.name);

    res.status(201).json({
      success: true,
      message: `A verification code was sent to ${user.email}`,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in create account: ", error);
    return next(
      new HttpError("Something went wrong when creatting an account", 500)
    );
  }
};

module.exports = {
  createAccount,
};
