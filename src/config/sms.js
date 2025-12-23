const axios = require("axios");

const sendSMS = async ({ to, text }) => {
  try {
    const response = await axios.post(
      `${process.env.SMS_BASE_URL}/sms/2/text/advanced`,
      {
        messages: [
          {
            from: "EduBooster",
            destinations: [{ to }],
            text,
          },
        ],
      },
      {
        headers: {
          Authorization: `App ${process.env.SMS_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("SMS error:", error.response?.data || error.message);
    throw new Error("SMS failed");
  }
};

module.exports = sendSMS;
