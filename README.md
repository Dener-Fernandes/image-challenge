# Image-Challenge

## Solution

The developed solution is a Node.js application with TypeScript that handles the reception, processing, and storage of images, based on a microservices architecture using RabbitMQ messaging. The application receives images through an HTTP route and stores them in a temporary folder (`tmp`). Then, a message is sent to a RabbitMQ queue, which triggers a service responsible for processing the image and generating optimized versions saved in the `output` folder. The optimized images are generated in the WebP format, which provides better compression and performance for web usage. Additionally, the system includes a retry mechanism that automatically attempts to reprocess failed tasks up to a configurable limit, enhancing reliability in case of transient errors.

Metadata persistence and image processing state control are handled with MongoDB. Both the application and the supporting services (RabbitMQ and MongoDB) can be easily run using Docker, simplifying environment setup and execution.

## Architecture

This project follows a **3-Tier architecture** pattern, structured into the following layers: Application, Domain, and Data.

The **Application** layer is responsible for handling incoming HTTP requests and delivering responses. It extracts the necessary data from the requests and forwards it to the Domain layer. It also manages communication with external services such as RabbitMQ and triggers auxiliary processes like image processing, acting as a bridge between the outside world and the core business logic.

The **Domain** layer represents the business logic tier. It contains the core rules of the system, including entities, value objects, and use cases. This layer is entirely decoupled from frameworks and infrastructure, ensuring that the business logic remains pure, reusable, and testable. All core operations and decisions of the system happen in this layer.

The **Data** layer corresponds to the data access tier. It is responsible for implementing repositories and managing the persistence of data in databases such as MongoDB.

By following this architecture, the system gains clear separation of concerns, better testability, and the flexibility to evolve each layer independently without impacting the others.

## Environment Setup

### Dependencies

The project uses the following key dependencies:

- **amqplib**: A client library for interacting with RabbitMQ using the AMQP protocol. It is used to publish and consume messages from queues, enabling asynchronous processing;

- **dotenv**: Loads environment variables from a `.env` file into `process.env`, making configuration management simple and secure across different environments;

- **express**: A minimal and flexible web framework for Node.js used to define HTTP routes and handle incoming requests and responses;

- **mongoose**: An elegant ODM (Object Data Modeling) library for MongoDB, providing a straightforward way to define schemas and interact with MongoDB collections;

- **multer**: Middleware for handling `multipart/form-data`, primarily used for uploading files via HTTP. In this project, it manages image uploads;

- **sharp**: A high-performance image processing library. It is used to manipulate and optimize images, such as resizing or format conversion;

- **uuid**: Generates universally unique identifiers (UUIDs), commonly used to create unique filenames or entity IDs.

### Environment Variables

- **PORT**: App port number;
- **RABBITMQ_URL**: URL to access RabbitMQ;
- **QUEUE_NAME**: Queue name where the task will be stored;
- **DATABASE_URL**: URL to access MongoDB.

### How to Run the Project

In your terminal, run the following commands in the order presented.

1. `docker-compose build --no-cache`;
2. `docker-compose up`.

## Tests

### Unit Tests

For this application, unit tests were implemented covering **ImageUseCase**, **ImageRepository**, and **RabbitMQService**. Below are instructions on how to run them.

- You can run all the tests using `npm run test`;
- Or you can run the suits separated using `npx jest` + relative path to the test file. Example: `npx jest "src/domain/use-cases/image-use-case.test.ts"`.

## API Usage Examples

Choose an API Plataform (ex: Postman, Insomnia). The one used in the examples is Postman.

### Uploading an Image

1. Set the URL and the request to be able to upload a file named image:  
   ![alt text](./src/application/images/image.png)

2. The success response will be like this:  
   ![alt text](./src/application/images/image-1.png)

### Retrieving a Processed Image

1. Set the URL and the request to be able to send a route param named task_id:  
   ![alt text](./src/application/images/image-2.png)

2. The success response will be like this:  
   ![alt text](./src/application/images/image-3.png)

## Key Design Decisions and Trade-offs

- A 3-tier architecture (Application, Domain, and Data layers) was adopted to ensure clear separation of concerns. This structure improves maintainability and readability, making it ideal for relatively simple services where modularity is important but full-blown architectural complexity is unnecessary;

- Dependency Inversion and Dependency Injection principles were applied where appropriate. This promotes decoupling between components, makes the system more testable, and allows greater flexibility when substituting implementations or integrating with external systems;

- A custom error-handling system was created without the use of external dependencies. When an error occurs (e.g., image not found), instead of throwing the raw error itself, a specific error title or identifier is thrown. This title is then captured by the error-handling system, which maps it to an appropriate HTTP status code and a descriptive message to be returned in the response;

- Logging functionality was added to monitor the application, providing useful information (e.g., whether the application successfully connected to the database) for development purposes. The logging tracks connection attempts, asynchronous calls, thrown errors, and image processing operations.
