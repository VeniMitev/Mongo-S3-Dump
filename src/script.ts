import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { PassThrough } from 'stream';
import * as child_process from 'child_process';
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config();

// const exec = promisify(child_process.exec);

async function backupMongoAndUploadToS3() {
    try {
        const region = process.env.AWS_REGION;
        const mongoUri = process.env.MONGO_URI;
        const s3Bucket = process.env.S3_BUCKET;
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

        console.log('Backing up MongoDB...');

        const s3 = new S3Client({
            region,
            credentials: { accessKeyId, secretAccessKey },
        });

        const dateTime = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
        const fileName = `dump_${dateTime}.gz`;
        const dumpCommand = `mongodump --uri="${mongoUri}" --gzip --archive`;

        const pass = new PassThrough();
        const dumpProcess = child_process.spawn('sh', ['-c', dumpCommand]);
        dumpProcess.stdout.pipe(pass);

        const upload = new Upload({
            client: s3,
            params: {
                Bucket: s3Bucket,
                Key: `mongo-backup/${fileName}`,
                Body: pass,
            },
            leavePartsOnError: false, // recommended to cleanup multipart uploads if they fail
        });

        upload.on('httpUploadProgress', (progress) => {
            console.log(`Upload progress: ${progress.loaded} of ${progress.total} bytes`);
        });

        await upload.done();
        console.log('Upload complete.');

    } catch (err) {
        console.error('Error:', err);
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
