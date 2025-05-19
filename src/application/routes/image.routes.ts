import express from "express";
import { ImageController } from "../controllers/image.controller";
import { handleUpload } from "../middlewares/upload.middleware";

const imageRoutes = express.Router();

const imageController = new ImageController();

imageRoutes.post("/", handleUpload, imageController.uploadImage);
imageRoutes.get(
  "/status/:task_id",
  handleUpload,
  imageController.getImageStatus,
);

export { imageRoutes };
