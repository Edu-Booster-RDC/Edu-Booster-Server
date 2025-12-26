const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["premium"],
      default: "premium",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      default: function () {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date;
      },
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    activationKey: {
      type: String,
    },

    keySent: {
      type: Boolean,
      default: false,
    },

    activationKeyExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
