import { Upload } from '@aws-sdk/lib-storage';
import { S3 } from '@aws-sdk/client-s3';
import * as child_process from 'child_process';
import * as fs from 'fs';
import { promisify } from 'util';
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config();

const exec = promisify(child_process.exec);

async function backupMongoAndUploadToS3() {
    try {
        const region = process.env.AWS_REGION;
        const mongoUri = process.env.MONGO_URI;
        const s3Bucket = process.env.S3_BUCKET;
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

        console.log('Backing up MongoDB...');

        // MongoDB dump command
        // Generate a date-time string in the format "YYYY-MM-DD_HH-mm-ss"
        const dateTime = new Date()
            .toISOString()
            .replace(/T/, '_')
            .replace(/:/g, '-')
            .split('.')[0];

        // Include the date-time string in the file name
        const fileName = `dump_${dateTime}.gz`;
        const dumpCommand = `mongodump --uri="${mongoUri}" --archive=${fileName} --gzip`;

        await exec(dumpCommand);

        // Initialize S3 client
        const s3 = new S3({
            region,

            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        // Read the dump file
        const fileContent = fs.readFileSync(fileName);

        // Upload to S3
        const params = {
            Bucket: s3Bucket,
            Key: `mongo-backup/${fileName}`,
            Body: fileContent,
        };

        await new Upload({
            client: s3,
            params,
        }).done();

        console.log('Upload complete.');

        fs.unlinkSync(fileName);

        console.log('Deleted temp dump file.');
    } catch (err) {
        console.log(err);
    }
}

// Cron schedule from environment variable
const cronSchedule = process.env.CRON_SCHEDULE || 'none';

// cron regex
const cronRegex =
    /^(\*|([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])) (\*|([0-9]|[1-2][0-9]|3[0-1])) (\*|([0-9]|1[0-2])) (\*|([0-7]))$/;

// Validate cron schedule format
if (!cronRegex.test(cronSchedule)) {
    console.log('Invalid cron schedule:', cronSchedule);
    process.exit(1);
}

console.log('Cron schedule:', cronSchedule);

// Run cron job
cron.schedule(cronSchedule, () => {
    console.log('Running cron job...');

    backupMongoAndUploadToS3();
});
