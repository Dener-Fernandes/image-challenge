import { ImageInterface } from "../../../domain/interfaces/image.interface";

interface ImageRepositoryInterface {
  create(task: ImageInterface): Promise<void>;
}

export { ImageRepositoryInterface };
