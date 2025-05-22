import { ErrorsInterface } from "../interfaces/error.interface";
import { errorsDescription } from "./errors";

function errorHandler(exception: string | Error): ErrorsInterface {
  const errorTitle =
    typeof exception === "string"
      ? exception
      : exception instanceof Error
        ? exception.message
        : "";

  const error = errorsDescription.find((error) => error.title === errorTitle);
  const internalServerErrorIndex = errorsDescription.length - 1;

  if (error) return error;

  return errorsDescription[internalServerErrorIndex];
}

export { errorHandler };
