const cloudinary = require("../config/cloudinary");

async function uploadPdfToCloudinary(buffer, fileName) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "raw",
          folder: "pgfs",
          public_id: fileName.replace(".pdf", ""),
          format: "pdf",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      )
      .end(buffer);
  });
}

module.exports = { uploadPdfToCloudinary };
