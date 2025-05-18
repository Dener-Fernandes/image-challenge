import { v4 as uuidv4 } from "uuid";

class ImageUseCase {
  async uploadImage(image: Express.Multer.File) {
    if (!image) throw new Error("Image was not sent");

    const taksId = uuidv4();

    const imagePayload = {
      taksId,
      originalFilename: image.originalname,
      path: image.path,
      mimetype: image.mimetype,
    };

    // TO DO
  }
}

export { ImageUseCase };
