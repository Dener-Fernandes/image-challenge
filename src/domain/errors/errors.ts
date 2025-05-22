import { ErrorsInterface } from "../interfaces/error.interface";

// The last error always needs to be the INTERNAL_SERVER_ERRROR
const errorsDescription: ErrorsInterface[] = [
  {
    title: "IMAGE_WAS_NOT_PROVIDED",
    status: 400,
    message: "Image was not provided",
  },
  {
    title: "TASK_ID_WAS_NOT_PROVIDED",
    status: 400,
    message: "task_id was not provided",
  },
  {
    title: "THIS_FILE_IS_NOT_AN_IMAGE",
    status: 400,
    message: "This file is not an image",
  },
  {
    title: "IMAGE_NOT_FOUND",
    status: 404,
    message: "Image not found",
  },
  {
    title: "INTERNAL_SERVER_ERROR",
    status: 500,
    message: "Internal Server Error.",
  },
];

export { errorsDescription };
