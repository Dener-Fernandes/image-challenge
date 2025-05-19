import { v4 as uuidv4 } from "uuid";
import { QueueServiceInterface } from "../../application/services/interfaces/queue-service.interface";
import { ImageInterface } from "../interfaces/image.interface";
import { ImageStatusEnum } from "../enums/image-status.enum";
import { ImageRepositoryInterface } from "../../data/repositories/interfaces/image-repository.interface";
import { ErrorsEnum } from "../enums/errors.enum";
import { UploadImageResponseInterface } from "../interfaces/upload-image-response.interface";

class ImageUseCase {
  constructor(
    private readonly queueService: QueueServiceInterface,
    private readonly imageRepository: ImageRepositoryInterface,
  ) {}

  async uploadImage(
    image: Express.Multer.File,
  ): Promise<UploadImageResponseInterface> {
    if (!image) throw ErrorsEnum.IMAGE_WAS_NOT_SENT;

    const taskId = uuidv4();

    const taskPayload = {
      taskId,
      originalFilename: image.originalname,
      path: image.path,
      mimetype: image.mimetype,
    };

    const queueName = process.env.QUEUE_NAME;

    await this.queueService.connect();

    await this.queueService.publish(queueName, taskPayload);

    return {
      taskId,
      status: ImageStatusEnum.PENDING,
    };
  }

  async create(image: ImageInterface) {
    await this.imageRepository.create(image);
  }

  async getImageStatus(taskId: string): Promise<string> {
    if (!taskId) throw new Error("task_id was not sent");

    const status = await this.imageRepository.getImageStatus(taskId);

    if (!status) throw ErrorsEnum.IMAGE_NOT_FOUND;

    return status;
  }
}

export { ImageUseCase };
