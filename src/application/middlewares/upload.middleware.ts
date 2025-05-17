import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";

const tmpFolder = path.resolve(__dirname, "../tmp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(tmpFolder)) {
      fs.mkdirSync(tmpFolder, { recursive: true });
    }
    cb(null, tmpFolder);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("This file is not an image"));
  }
};

export const upload = multer({ storage, fileFilter }).single("image");

export const handleUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ error: "Error when uploading image", details: err.message });
    } else if (err) {
      return res.status(400).json({ error: "Error when uploading image" });
    }

    next();
  });
};
