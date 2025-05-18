import express from "express";

import dotenv from "dotenv";
import { routes } from "./routes";

const app = express();

dotenv.config({ path: "./.env" });

app.use(express.json());

app.use("/image-upload", routes);

export { app };
