import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../domain/errors/error-handler";
import { ErrorsEnum } from "../../domain/enums/errors.enum";

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
    cb(new Error(ErrorsEnum.THIS_FILE_IS_NOT_AN_IMAGE));
  }
};

export const upload = multer({ storage, fileFilter }).single("image");

export const handleUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload(req, res, (error: any) => {
    if (error instanceof multer.MulterError) {
      const handledError = errorHandler(error.message as string);

      return res
        .status(handledError.status)
        .json({ message: handledError.message });
    } else if (error) {
      const handledError = errorHandler(error as string);

      return res
        .status(handledError.status)
        .json({ message: handledError.message });
    }

    next();
  });
};
