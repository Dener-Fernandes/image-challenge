import { ImageStatusEnum } from "../enums/image-status.enum";
import { OriginalMetadataInterface } from "./original-metadata.interface";

interface ImageInterface {
  taskId: string;
  originalFilename: string;
  status: ImageStatusEnum;
  errorMessage: string | null;
  mimetype: string;
  processedAt: Date;
  originalMetadata: OriginalMetadataInterface | null;
  versions: {
    low: ImageVersionInterface;
    medium: ImageVersionInterface;
    high_optimized: ImageVersionInterface;
  } | null;
}

export { ImageInterface };
