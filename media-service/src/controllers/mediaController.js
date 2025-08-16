const logger = require("../utils/logger");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const Media = require("../models/media");

const uploadModel = async (req, res) => {
  logger.info("Upload media request received");

  try {
    const file = req.file;
    if (!file) {
      logger.error("No file uploaded");
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { originalname, mimetype, buffer } = file;
    logger.info(`File details - Name: ${originalname}, Type: ${mimetype}`);
    logger.info("Uploading to Cloudinary started");
    const cloudinaryUploadResult = await uploadMediaToCloudinary(file);
    logger.info(
      `File uploaded to Cloudinary successfully, Public Id: ${cloudinaryUploadResult.public_id}`
    );

    const newlyUploadedMedia = Media.create({
      publicId: cloudinaryUploadResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: cloudinaryUploadResult.secure_url,
      userId: req.user._id,
      size: buffer.length,
    });

    logger.info("Media saved to MongoDb successfully");
    return res.status(201).json({
      success: true,
      mediaId: newlyUploadedMedia._id,
      url: newlyUploadedMedia.url,
      message: "Media uploaded successfully",
    });
  } catch (error) {
    logger.error("Error uploading media", { error });
    return res.status(500).json({
      success: false,
      message: "Error uploading media",
      error: error.message,
    });
  }
};

module.exports = {
  uploadModel,
};
