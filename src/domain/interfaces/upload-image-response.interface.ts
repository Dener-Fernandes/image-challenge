import { ImageStatusEnum } from "../enums/image-status.enum";

interface UploadImageResponseInterface {
  taskId: string;
  status: ImageStatusEnum;
}

export { UploadImageResponseInterface };
