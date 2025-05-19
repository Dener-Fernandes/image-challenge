import express from "express";

import dotenv from "dotenv";
import { routes } from "./routes";
import { startWorker } from "./workers/image-processor.worker";
import { connect } from "mongoose";

const app = express();

dotenv.config({ path: "./.env" });

const dataBase = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

connect(dataBase)
  .then(() => console.log("Connected to database"))
  .catch((err) => {
    console.log("Could not connect to database");
  });

app.use(express.json());

app.use("/image-upload", routes);

startWorker().catch(console.error);

export { app };
