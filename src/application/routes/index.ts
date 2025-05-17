import express from "express";
import { imageRoutes } from "./image.routes";

const routes = express.Router();

routes.use("/upload", imageRoutes);

export { routes };
