import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_NAME,
});

const fileUpload = async (filePath) => {
  try {
    if (!filePath) return null;
    // Upload the file on the cloudinary
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("File Uploaded Successfully!", response.url);
    return response;
  } catch (error) {
    // Remove the file from the server as the upload file operation got failed!
    fs.unlinkSync(filePath);
  }
};

export { fileUpload };
