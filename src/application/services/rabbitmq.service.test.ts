import amqplib from "amqplib";
import { RabbitMQService } from "./rabbitmq.service";
import { TaskPayloadInterface } from "../../domain/interfaces/task-payload.interface";
import { logger } from "../utils/logger";

jest.mock("amqplib");

let service: RabbitMQService;
let mockChannel: any;
let mockConnection: any;
const fakeUrl = "FAKE_URL";

describe("RabbitMQService", () => {
  beforeEach(async () => {
    mockChannel = {
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
      consume: jest.fn(),
      ack: jest.fn(),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
    };

    (amqplib.connect as jest.Mock).mockResolvedValue(mockConnection);

    service = new RabbitMQService(fakeUrl);
    await service.connect();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be able to publish a message", async () => {
    const fakeTask: TaskPayloadInterface = {
      taskId: "123e4567-e89b-12d3-a456-426614174000",
      originalFilename: "test.jpg",
      path: "/tmp/test.jpg",
      mimetype: "image/jpeg",
      retryCount: 0,
    };

    await service.publish("test-queue", fakeTask);

    expect(mockChannel.assertQueue).toHaveBeenCalledWith("test-queue", {
      durable: true,
    });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "test-queue",
      Buffer.from(JSON.stringify(fakeTask)),
      { persistent: true },
    );
  });

  it("should be able to consume a message and call the callback", async () => {
    const fakeTask: TaskPayloadInterface = {
      taskId: "123e4567-e89b-12d3-a456-426614174000",
      originalFilename: "test.jpg",
      path: "/tmp/test.jpg",
      mimetype: "image/jpeg",
      retryCount: 0,
    };

    const fakeMessage = {
      content: Buffer.from(JSON.stringify(fakeTask)),
    };

    const mockCallback = jest.fn().mockResolvedValue(undefined);

    mockChannel.consume.mockImplementation((_queue: string, handler: any) => {
      handler(fakeMessage);
    });

    await service.consume("test-queue", mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(fakeTask, fakeMessage);
  });

  it("should be able to acknowledge a message", () => {
    const fakeMessage = {} as any;

    service["channel"] = mockChannel;

    service.acknowledge(fakeMessage);

    expect(mockChannel.ack).toHaveBeenCalledWith(fakeMessage);
  });

  it("should b able to throw an error if publish is called before connect", async () => {
    const service = new RabbitMQService(fakeUrl);

    const fakeTask = {
      taskId: "123e4567-e89b-12d3-a456-426614174000",
      originalFilename: "image.jpg",
      path: "/tmp/image.jpg",
      mimetype: "image/jpeg",
      retryCount: 0,
    };

    await expect(service.publish("queue", fakeTask)).rejects.toThrow(
      "Channel is not initialized. Call connect() first",
    );
  });

  it("should be able to throw an error if consume is called before connect", async () => {
    const service = new RabbitMQService(fakeUrl);

    await expect(service.consume("queue", jest.fn())).rejects.toThrow(
      "Channel is not initialized. Call connect() first",
    );
  });

  it("should log an error if acknowledge is called before connect", () => {
    const service = new RabbitMQService(fakeUrl);

    const errorSpy = jest.spyOn(logger, "error").mockImplementation(() => {});

    service.acknowledge({} as any);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        err: expect.any(Error),
      }),
      "[RabbitMQService, acknowledge method] Failed to acknowledge message",
    );

    errorSpy.mockRestore();
  });

  it("should be able to throw an error if processing image fails", async () => {
    const service = new RabbitMQService(fakeUrl);
    await service.connect();

    const message = {
      content: Buffer.from(
        JSON.stringify({
          taskId: "abc",
          originalFilename: "x",
          path: "y",
          mimetype: "z",
        }),
      ),
    };

    const faultyCallback = jest
      .fn()
      .mockRejectedValue(new Error("Callback error"));

    mockChannel.consume.mockImplementation((_queue, handler) => {
      return handler(message as any).catch((err: Error) => {
        expect(err.message).toBe("Error when processing image");
      });
    });

    await service.consume("queue", faultyCallback);
  });
});
