import { RabbitMQService } from "../../application/services/rabbitmq.service";
import { ImageRepository } from "../../data/repositories/image.repository";
import { ErrorsEnum } from "../enums/errors.enum";
import { ImageStatusEnum } from "../enums/image-status.enum";
import { ImageInterface } from "../interfaces/image.interface";
import { ImageUseCase } from "./image.use-case";

import { Readable } from "stream";

const rabbitmqService = new RabbitMQService("FAKE_RABBITMQ_URL");
const imageRepository = ImageRepository.getInstance();

let imageUseCase: ImageUseCase;

beforeEach(() => {
  rabbitmqService.connect = jest.fn().mockResolvedValue(undefined);
  rabbitmqService.publish = jest.fn().mockResolvedValue(undefined);
  imageRepository.create = jest.fn().mockResolvedValue(undefined);

  imageUseCase = new ImageUseCase(rabbitmqService, imageRepository);
});

describe("ImageUseCase tests", () => {
  it("should be able to upload an image", async () => {
    const fakeImage: Express.Multer.File = {
      fieldname: "image",
      originalname: "test-image.png",
      encoding: "7bit",
      mimetype: "image/png",
      size: 1024,
      destination: "/tmp",
      filename: "fake-image-uuid.png",
      path: "/tmp/fake-image-uuid.png",
      buffer: Buffer.from("fake image content"),
      stream: Readable.from(Buffer.from("fake image content")),
    };

    const result = await imageUseCase.uploadImage(fakeImage);

    expect(result).toHaveProperty("taskId");
    expect(result).toHaveProperty("status");
    expect(result.status).toBe(ImageStatusEnum.PENDING);
  });

  it("should be able to throw an error if image was not sent", () => {
    const fakeImage = undefined;

    const result = imageUseCase.uploadImage(fakeImage);

    expect(result).rejects.toBe(ErrorsEnum.IMAGE_WAS_NOT_SENT);
  });
});
