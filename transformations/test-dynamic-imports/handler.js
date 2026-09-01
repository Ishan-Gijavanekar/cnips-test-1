import axios from "axios";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
export async function execute(event, config, vars, LOG) {
    try {  
        const picture = 'https://campusfounders.de/wp-content/uploads/2021/09/campusfounders_logo_white.svg';
        LOG.info('Picture: ', picture);
        const s3 = await getS3Client(vars, LOG);
        const resp =await downloadAndUploadToS3(s3, picture, vars, "test", LOG);
        LOG.info('S3 URL: ', resp);
        LOG.info(`Event details: %s, Config: %j, Vars: %j`, event, config, vars);
        // Transformation logic goes here
        let transformedEvent = {
            processed: true,
            originalEvent: event,
            timestamp: new Date(),
        }
        return transformedEvent;
    } catch (error) {
        // Log and throw meaningful errors so that its easier for debugging
        LOG.error(`Error executing event ${event}:`, error);
        throw error;
    }
}

async function getS3Client(vars, LOG){
      //const { S3Client} = await import("@aws-sdk/client-s3");

    const s3 = new S3Client({
        region: 'auto',
        endpoint: vars.storage_endpoint,
        credentials: {
            accessKeyId: vars.storage_access_key_id,
            secretAccessKey: vars.storage_secret_access_key,
            },
        forcePathStyle: true,
    });
    return s3;
}

async function downloadAndUploadToS3(s3, url, vars, campus_id, LOG) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        // Prepare upload params
        const uploadParams = {
            Bucket: vars.storage_bucket_Name,
            Key: `${campus_id}.json`,
            Body: Buffer.from(response.data),
            ContentType: response.headers['content-type'] || 'application/octet-stream'
            //ACL: 'public-read' // Optional: set ACL as needed
        };
        // Upload to S3
        //const { PutObjectCommand} = await import("@aws-sdk/client-s3");
        const command = new PutObjectCommand(uploadParams);
        await s3.send(command);
        return `https://${vars.storage_bucket_Name}.${vars.storage_endpoint}${campus_id}.json`; // or your custom domain/path
    } catch(e){
        LOG.error('error downloading Profil Picture and uploading to S3', e);
        throw new Error('error download Profile Picture & upload to S3');
    }
}