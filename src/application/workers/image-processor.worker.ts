import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { RabbitMQService } from "../services/rabbitmq.service";
import { ImageUseCase } from "../../domain/use-cases/image.use-case";
import { ImageStatusEnum } from "../../domain/enums/image-status.enum";
import { ImageRepository } from "../../data/repositories/image.repository";
import { logger } from "../utils/logger";
import { existsSync } from "fs";

const rabbitMQUrl = process.env.RABBITMQ_URL;
const queueName = process.env.QUEUE_NAME;
const outputDir = path.resolve(__dirname, "../output");

const maxRetries = 3;

async function startWorker() {
  const rabbitService = new RabbitMQService(rabbitMQUrl);

  try {
    await rabbitService.connect();
    logger.info("[startWorker] RabbitMQ connection established in worker");
  } catch (error) {
    logger.error({ err: error }, "[startWorker] Failed to connect to RabbitMQ");

    throw error;
  }

  const imageRepository = ImageRepository.getInstance();
  const imageUseCase = new ImageUseCase(rabbitService, imageRepository);

  await fs.mkdir(outputDir, { recursive: true });

  await rabbitService.consume(queueName, async (task, msg) => {
    if (!msg) return;

    const { taskId, originalFilename, path: imagePath, mimetype } = task;

    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      await fs.mkdir(`${outputDir}/${taskId}`, { recursive: true });

      const baseName = path.parse(originalFilename).name;

      const versions = {
        low: `${outputDir}/${taskId}/low-${baseName}.webp`,
        medium: `${outputDir}/${taskId}/medium-${baseName}.webp`,
        high_optimized: `${outputDir}/${taskId}/high-${baseName}.webp`,
      };

      await image
        .clone()
        .resize({ width: 320 })
        .toFormat("webp")
        .toFile(versions.low);
      await image
        .clone()
        .resize({ width: 800 })
        .toFormat("webp")
        .toFile(versions.medium);
      await image.clone().toFormat("webp").toFile(versions.high_optimized);

      const lowStats = await fs.stat(versions.low);
      const mediumStats = await fs.stat(versions.medium);
      const highStats = await fs.stat(versions.high_optimized);

      await imageUseCase.create({
        taskId,
        originalFilename,
        mimetype,
        processedAt: new Date(),
        status: ImageStatusEnum.COMPLETED,
        errorMessage: null,
        originalMetadata: {
          width: metadata.width,
          height: metadata.height,
          mimetype,
          exif: metadata.exif || {},
        },
        versions: {
          low: { path: versions.low, size: lowStats.size },
          medium: { path: versions.medium, size: mediumStats.size },
          high_optimized: {
            path: versions.high_optimized,
            size: highStats.size,
          },
        },
      });

      if (existsSync(imagePath)) {
        await fs.unlink(imagePath);
      }

      logger.info(
        { taskId },
        "[startWorker] Image processed and original file deleted",
      );

      rabbitService.acknowledge(msg);

      logger.info({ taskId }, "[startWorker] Message acknowledged");
    } catch (error) {
      const retryCount = Number(task.retryCount ?? 0);

      if (retryCount < maxRetries) {
        logger.warn(
          `[startWorker] Retrying task ${taskId}. Attempt #${retryCount + 1}`,
        );

        await rabbitService.publish(queueName, {
          ...task,
          retryCount: retryCount + 1,
        });
      } else {
        logger.error(
          { err: error },
          `Task ${taskId} failed after ${maxRetries} attempts`,
        );

        await imageUseCase.create({
          taskId,
          originalFilename,
          mimetype,
          processedAt: new Date(),
          status: ImageStatusEnum.FAILED,
          errorMessage: error.message,
          originalMetadata: null,
          versions: null,
        });

        if (existsSync(imagePath)) {
          await fs.unlink(imagePath);
        }

        logger.warn(
          { taskId },
          "[startWorker] Image not processed and original file deleted",
        );
      }

      rabbitService.acknowledge(msg);

      logger.warn({ taskId }, "[startWorker] Failed task message acknowledged");
    }
  });
}

export { startWorker };
