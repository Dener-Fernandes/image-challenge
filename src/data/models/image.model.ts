// src/infra/database/models/image.model.ts
import { Schema, model } from "mongoose";
import { ImageStatusEnum } from "../../domain/enums/image-status.enum";

const imageSchema = new Schema({
  taskId: { type: String, required: true },
  originalFilename: { type: String, required: true },
  status: {
    type: String,
    enum: ImageStatusEnum,
    required: true,
  },
  originalMetadata: {
    width: Number,
    height: Number,
    mimetype: String,
    exif: Object,
  },
  processedAt: Date,
  errorMessage: String,
  versions: {
    low: {
      path: String,
      size: Number,
    },
    medium: {
      path: String,
      size: Number,
    },
    high_optimized: {
      path: String,
      size: Number,
    },
  },
});

const ImageModel = model("Image", imageSchema);

export { ImageModel };
