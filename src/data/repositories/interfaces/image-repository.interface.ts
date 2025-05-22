import { ImageInterface } from "../../../domain/interfaces/image.interface";

interface ImageRepositoryInterface {
  create(image: ImageInterface): Promise<void>;
  getImageStatus(taskId: string): Promise<string | null>;
}

export { ImageRepositoryInterface };
