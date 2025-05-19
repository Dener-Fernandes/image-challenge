import { ImageInterface } from "../../domain/interfaces/image.interface";
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

  async create(image: ImageInterface): Promise<void> {
    await ImageModel.create(image);
  }

  async getImageStatus(taskId: string): Promise<string | null> {
    const result = await ImageModel.findOne({ taskId }, { status: 1 }).lean();

    return result?.status || null;
  }
}

export { ImageRepository };
