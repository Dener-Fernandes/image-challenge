import { TaskPayloadInterface } from "../../../domain/interfaces/task-payload.interface";

interface ImageRepositoryInterface {
  create(task: TaskPayloadInterface): Promise<void>;
}

export { ImageRepositoryInterface };
