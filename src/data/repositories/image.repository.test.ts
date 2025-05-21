import { ImageStatusEnum } from "../../domain/enums/image-status.enum";
import { ImageInterface } from "../../domain/interfaces/image.interface";
import { ImageModel } from "../models/image.model";
import { ImageRepository } from "./image.repository";

jest.mock("../models/image.model");

afterEach(() => {
  jest.clearAllMocks();
});

describe("ImageRepository tests", () => {
  const imageRepository = ImageRepository.getInstance();

  it("should be able to save an image in the database", async () => {
    const fakeImage: ImageInterface = {
      taskId: "123e4567-e89b-12d3-a456-426614174000",
      originalFilename: "image.jpg",
      status: ImageStatusEnum.COMPLETED,
      errorMessage: null,
      mimetype: "image/jpeg",
      processedAt: new Date(),
      originalMetadata: {
        width: 800,
        height: 600,
        mimetype: "image/jpeg",
        exif: {},
      },
      versions: {
        low: { path: "output/low.jpg", size: 12345 },
        medium: { path: "output/medium.jpg", size: 23456 },
        high_optimized: { path: "output/high.jpg", size: 34567 },
      },
    };

    const mockedMethod = jest
      .spyOn(ImageModel, "create")
      .mockResolvedValueOnce(null);

    await imageRepository.create(fakeImage);

    expect(mockedMethod).toHaveBeenCalledWith(fakeImage);
  });

  it("should be able to return an image status from the database", async () => {
    const taskId = "123e4567-e89b-12d3-a456-426614174000";
    const mockedStatus = ImageStatusEnum.COMPLETED;

    jest.spyOn(ImageModel, "findOne").mockReturnValueOnce({
      lean: () => Promise.resolve({ status: mockedStatus }),
    } as any);

    const result = await imageRepository.getImageStatus(taskId);

    expect(result).toBe(mockedStatus);
  });

  it("should be able to return null if the image was not found", async () => {
    const taskId = "123e4567-e89b-12d3-a456-426614174000";

    jest.spyOn(ImageModel, "findOne").mockReturnValueOnce({
      lean: () => Promise.resolve(null),
    } as any);

    const result = await imageRepository.getImageStatus(taskId);

    expect(result).toBeNull();
  });
});
