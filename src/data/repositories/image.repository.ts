import { TaskPayloadInterface } from "../../domain/interfaces/task-payload.interface";
import { ImageModel } from "../models/image.model";
import { ImageRepositoryInterface } from "./interfaces/image-repository.interface";

class ImageRepository implements ImageRepositoryInterface {
  private static INSTANCE: ImageRepository;

  static getInstance(): ImageRepository {
    if (!ImageRepository.INSTANCE) {
      ImageRepository.INSTANCE = new ImageRepository();
    }

    return ImageRepository.INSTANCE;
  }

  async create(task: TaskPayloadInterface): Promise<void> {
    await ImageModel.create(task);
  }
}

export { ImageRepository };
