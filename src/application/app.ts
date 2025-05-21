import express from "express";

import dotenv from "dotenv";
import { routes } from "./routes";
import { startWorker } from "./workers/image-processor.worker";
import { connect } from "mongoose";
import { logger } from "./utils/logger";

const app = express();

dotenv.config({ path: "./.env" });

const dataBase = process.env.DATABASE_URL;

connect(dataBase)
  .then(() => logger.info("Connected to database"))
  .catch((error) => {
    logger.error({ error }, "Could not connect to database");
  });

app.use(express.json());

app.use("/image-upload", routes);

startWorker().catch((error) => {
  logger.error({ error }, "Worker failed to start");
});

export { app };
