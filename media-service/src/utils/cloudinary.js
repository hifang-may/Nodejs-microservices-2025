const cloudinary = require("cloudinary").v2;
const logger = require("./logger");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMediaToCloudinary = async (filePath) => {
  try {
    const uploadStream = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    logger.info("Media uploaded successfully", { result });
    uploadStream.end(filePath.buffer);
    return result;
  } catch (error) {
    logger.error("Error uploading media", { error });
    throw error;
  }
};

const deleteMedia = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });
    logger.info("Media deleted successfully", { result });
    return result;
  } catch (error) {
    logger.error("Error deleting media", { error });
    throw error;
  }
};

module.exports = {
  uploadMediaToCloudinary,
};
