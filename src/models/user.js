const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true, sparse: true }, // <--- add this
    role: { type: String, enum: ["admin", "student"], default: "student" },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    phone: { type: String },
    phoneCode: { type: String },
    phoneCodeExpiration: { type: Date },
    isPhoneVerified: { type: Boolean, default: false },
    emailCode: { type: String },
    emailCodeExpiration: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    pendingEmail: { type: String },
    pendingEmailCode: { type: String },
    pendingEmailCodeExpiration: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpiration: { type: Date },
    refreshToken: { type: String },
    province: { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    stats: {
      coursesCompleted: Number,
      averageScore: Number,
      predictedSuccessRate: Number,
    },
  },
  { timestamps: true }
);
