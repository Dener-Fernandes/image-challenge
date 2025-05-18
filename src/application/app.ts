import express from "express";

import dotenv from "dotenv";
import { routes } from "./routes";
import { startWorker } from "./workers/image-processor.worker";

const app = express();

dotenv.config({ path: "./.env" });

app.use(express.json());

app.use("/image-upload", routes);

startWorker().catch(console.error);

export { app };
