import { Response, Request } from "express";
import { ImageUseCase } from "../../domain/use-cases/image.use-case";
import { RabbitMQService } from "../services/rabbitmq.service";

class ImageController {
  private readonly imageUseCase: ImageUseCase;

  constructor() {
    this.imageUseCase = new ImageUseCase(
      new RabbitMQService(process.env.RABBITMQ_URL),
    );

    this.uploadImage = this.uploadImage.bind(this);
  }

  async uploadImage(req: Request, res: Response): Promise<void> {
    const { file } = req;

    const result = await this.imageUseCase.uploadImage(file);

    res.status(200).json(result);
  }
}

export { ImageController };
