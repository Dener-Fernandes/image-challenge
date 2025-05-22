interface TaskPayloadInterface {
  taskId: string;
  originalFilename: string;
  path: string;
  mimetype: string;
  retryCount: number;
}

export { TaskPayloadInterface };
