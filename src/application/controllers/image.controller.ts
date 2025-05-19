import { Response, Request } from "express";
import { ImageUseCase } from "../../domain/use-cases/image.use-case";
import { RabbitMQService } from "../services/rabbitmq.service";
import { ImageRepository } from "../../data/repositories/image.repository";
import { errorHandler } from "../../domain/errors/error-handler";

class ImageController {
  private readonly imageUseCase: ImageUseCase;

  constructor() {
    this.imageUseCase = new ImageUseCase(
      new RabbitMQService(process.env.RABBITMQ_URL),
      ImageRepository.getInstance(),
    );

    this.uploadImage = this.uploadImage.bind(this);
    this.getImageStatus = this.getImageStatus.bind(this);
  }

  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const { file } = req;

      const result = await this.imageUseCase.uploadImage(file);

      res.status(200).json(result);
    } catch (error) {
      const handledError = errorHandler(error);

      res.status(handledError.status).json({ message: handledError.message });
    }
  }

  async getImageStatus(req: Request, res: Response): Promise<void> {
    try {
      const taskId = req.params.task_id;

      const status = await this.imageUseCase.getImageStatus(taskId);

      res.status(200).json({ status });
    } catch (error) {
      const handledError = errorHandler(error);

      res.status(handledError.status).json({ message: handledError.message });
    }
  }
}

export { ImageController };
