import { v2 as cloudinary } from "cloudinary";
import { configDotenv } from "dotenv";

configDotenv(); 

console.log("Cloud Name:", process.env.CLOUD_NAME); 

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET_KEY,
});

export default cloudinary;
