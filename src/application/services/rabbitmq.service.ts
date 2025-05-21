import amqp, { Channel, Connection, ConsumeMessage } from "amqplib";
import { QueueServiceInterface } from "./interfaces/queue-service.interface";
import { TaskPayloadInterface } from "../../domain/interfaces/task-payload.interface";
import { logger } from "../utils/logger";

class RabbitMQService implements QueueServiceInterface {
  private connection!: Connection;
  private channel!: Channel;

  constructor(private readonly url: string) {}

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      logger.info(
        "[RabbitMQService, connect method] RabbitMQ connection and channel established",
      );
    } catch (error) {
      logger.error(
        { err: error },
        "[RabbitMQService, connect method] Failed to connect to RabbitMQ",
      );

      throw error;
    }
  }

  async publish(queue: string, task: TaskPayloadInterface): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel is not initialized. Call connect() first");
    }

    await this.channel.assertQueue(queue, { durable: true });

    const messageBuffer = Buffer.from(JSON.stringify(task));

    const success = this.channel.sendToQueue(queue, messageBuffer, {
      persistent: true,
    });

    if (success) {
      logger.info(
        { taskId: task.taskId },
        `[RabbitMQService, publish method] Message published to queue '${queue}'`,
      );
    } else {
      logger.warn(
        { taskId: task.taskId },
        `[RabbitMQService, publish method] Failed to publish message to queue '${queue}'`,
      );
    }
  }

  async consume(
    queue: string,
    callback: (
      task: TaskPayloadInterface,
      rawMessage?: ConsumeMessage,
    ) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel is not initialized. Call connect() first");
    }

    await this.channel.assertQueue(queue, { durable: true });

    this.channel.consume(
      queue,
      async (msg) => {
        if (msg) {
          try {
            const content = msg.content.toString();
            const task: TaskPayloadInterface = JSON.parse(content);

            logger.info(
              `[RabbitMQService, consume method] Message received from queue ${queue}. taskdId: ${task.taskId}`,
            );

            await callback(task, msg);
          } catch (err) {
            logger.error(
              { err },
              "[RabbitMQService, consume method] Failed to process message",
            );

            this.acknowledge(msg);
          }
        }
      },
      {
        noAck: false,
      },
    );

    logger.info(`[RabbitMQService] Started consuming queue '${queue}'`);
  }

  acknowledge(rawMessage: ConsumeMessage): void {
    try {
      if (!this.channel) {
        throw new Error("Channel is not initialized. Call connect() first");
      }

      this.channel.ack(rawMessage);
    } catch (err) {
      logger.error(
        { err },
        "[RabbitMQService, acknowledge method] Failed to acknowledge message",
      );
    }
  }
}

export { RabbitMQService };
