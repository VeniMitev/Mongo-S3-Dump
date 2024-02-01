# MongoDB Backup and AWS S3 Upload

This project automates the backup process of a MongoDB database and uploads the backup file to AWS S3. It utilizes a Node.js script to perform the backup using `mongodump`, compresses the backup, and then uploads it to a specified S3 bucket. The process can be scheduled using cron syntax to run at regular intervals.

## Features

- Automated MongoDB backups with `mongodump`
- Backup compression using gzip
- Secure backup upload to AWS S3
- Scheduled backups using cron syntax
- Dockerized application for easy deployment and isolation

## Prerequisites

- Node.js (v16 or later)
- Docker (if deploying using Docker)
- MongoDB database access
- AWS account with S3 access

## Setup

### Clone the Repository

```bash
git clone https://github.com/VeniMitev/Mongo-S3-Dump.git
cd Mongo-S3-Dump
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a '.env' file by copying the template file and replacing the placeholders with your values:

If using Docker Compose, you can also set the environment variables in the `docker-compose.yml` file by copying the template file and replacing the placeholders with the actual values.

## Usage

### Direct Execution

Run the script directly using Node.js:

Install the dependencies:

```bash
npm install
```

Compile the TypeScript files to JavaScript using the `build` script defined in your `package.json`. This step assumes you have a script named `build` that invokes the TypeScript compiler (usually `tsc`).

```bash
npm run build
```

After compiling the TypeScript files, you can run the built JavaScript using Node.js:

```bash
npm start
```

### Docker with Docker Compose

The project includes a `Dockerfile` and `docker-compose.yml` file for easy deployment using Docker.

Build and run the Docker image:

```bash
docker-compose up --build
```

The Docker container will run the backup process according to the schedule defined in the `CRON_SCHEDULE` environment variable.

### Docker without Docker Compose

If you prefer to run the Docker container without Docker Compose, you can build and run the container manually.

Build the Docker image:

```bash
docker build -t mongo-s3-dump .
```

Run the Docker container:

```bash
docker run --env-file .env mongo-s3-dump
```

## Configuration

The following environment variables are used to configure the backup process:

- `AWS_REGION`: The AWS region where the S3 bucket is located.
- `MONGO_URI`: The connection URI for the MongoDB database.
- `S3_BUCKET`: The name of the S3 bucket where the backup file will be uploaded.
- `AWS_ACCESS_KEY_ID`: The AWS access key ID with permission to upload to the S3 bucket.
- `AWS_SECRET_ACCESS_KEY`: The AWS secret access key corresponding to the access key ID.
- `CRON_SCHEDULE`: The schedule for running the backup process in cron syntax.

### Scheduling Backups

The `CRON_SCHEDULE` environment variable is used to define the schedule for running the backup process. The value should be a valid cron expression that specifies the desired schedule. For example, to run the backup process every day at 2:00 AM, you can use the following value:

```plaintext
0 2 * * *
```

The schedule is defined using the following format:

```plaintext
* * * * *
| | | | |
| | | | +---- Day of the week (0 - 7) (Sunday=0 or 7)
| | | +------ Month (1 - 12)
| | +-------- Day of the month (1 - 31)
| +---------- Hour (0 - 23)
+------------ Minute (0 - 59)
```

For more information on cron syntax, refer to the [Wikipedia page](https://en.wikipedia.org/wiki/Cron).

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- [MongoDB](https://www.mongodb.com/)
- [AWS S3](https://aws.amazon.com/s3/)
- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
