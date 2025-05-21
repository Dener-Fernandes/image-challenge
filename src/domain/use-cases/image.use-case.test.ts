import { RabbitMQService } from "../../application/services/rabbitmq.service";
import { ImageRepository } from "../../data/repositories/image.repository";
import { ErrorsEnum } from "../enums/errors.enum";
import { ImageStatusEnum } from "../enums/image-status.enum";
import { ImageInterface } from "../interfaces/image.interface";
import { ImageUseCase } from "./image.use-case";

import { v4 as uuidv4 } from "uuid";

import { Readable } from "stream";

const rabbitmqService = new RabbitMQService("FAKE_URL");
const imageRepository = ImageRepository.getInstance();
const imageStatus = { status: ImageStatusEnum.COMPLETED };
const imageUseCase = new ImageUseCase(rabbitmqService, imageRepository);

beforeEach(() => {
  rabbitmqService.connect = jest.fn();
  rabbitmqService.publish = jest.fn();
  imageRepository.create = jest.fn().mockResolvedValue(undefined);
  imageRepository.getImageStatus = jest.fn().mockResolvedValue(imageStatus);
});

afterEach(() => {
  jest.clearAllMocks();
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

  it("should be able to throw an error if image was not provided", () => {
    const fakeImage = undefined;

    const result = imageUseCase.uploadImage(fakeImage);

    expect(result).rejects.toBe(ErrorsEnum.IMAGE_WAS_NOT_PROVIDED);
  });

  it("should be able to save an image", async () => {
    const fakeImage: ImageInterface = {
      taskId: "123e4567-e89b-12d3-a456-426614174000",
      originalFilename: "example.jpg",
      status: ImageStatusEnum.COMPLETED,
      errorMessage: null,
      mimetype: "image/jpeg",
      processedAt: new Date("2025-01-01T12:00:00Z"),
      originalMetadata: {
        width: 1920,
        height: 1080,
        mimetype: "image/jpeg",
        exif: {},
      },
      versions: {
        low: {
          path: "/output/123/low-example.jpg",
          size: 20480, // bytes
        },
        medium: {
          path: "/output/123/medium-example.jpg",
          size: 102400,
        },
        high_optimized: {
          path: "/output/123/high-example.jpg",
          size: 204800,
        },
      },
    };

    const spyiedMethod = jest.spyOn(imageUseCase, "create");
    await imageUseCase.create(fakeImage);

    expect(spyiedMethod).toHaveBeenCalledWith(fakeImage);
  });

  it("should be able to get an image status", async () => {
    const taskId = uuidv4();

    const result = await imageUseCase.getImageStatus(taskId);

    expect(result).toEqual(imageStatus);
  });

  it("should be able to throw an error if taskId was not provided", () => {
    const taskId = ":task_id";

    const result = imageUseCase.getImageStatus(taskId);

    expect(result).rejects.toBe(ErrorsEnum.TASK_ID_WAS_NOT_PROVIDED);
  });

  it("should be able to throw an error if image was not found", () => {
    imageRepository.getImageStatus = jest.fn().mockResolvedValueOnce(null);

    const taskId = uuidv4();

    const result = imageUseCase.getImageStatus(taskId);

    expect(result).rejects.toBe(ErrorsEnum.IMAGE_NOT_FOUND);
  });
});
