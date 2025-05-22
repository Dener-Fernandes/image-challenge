import { TaskPayloadInterface } from "../../../domain/interfaces/task-payload.interface";
import { ConsumeMessage } from "amqplib";

interface QueueServiceInterface {
  connect(): Promise<void>;
  publish(queue: string, task: TaskPayloadInterface): Promise<void>;
  consume(
    queue: string,
    callback: (
      task: TaskPayloadInterface,
      rawMessage?: ConsumeMessage,
    ) => Promise<void>,
  ): Promise<void>;
  acknowledge(rawMessage: ConsumeMessage): void;
}

export { QueueServiceInterface };
