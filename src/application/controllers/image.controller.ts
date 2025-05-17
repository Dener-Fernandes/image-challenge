import { Response, Request } from "express";

class ImageController {
  async uploadImage(req: Request, res: Response): Promise<void> {
    const { file } = req;

    // TO DO

    res.status(200).send();
  }
}

export { ImageController };
