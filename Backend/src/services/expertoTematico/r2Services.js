// services/r2Services.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

export class MaterialService {
    static async uploadToR2(file) {
        const extension = file.originalname.split('.').pop();
        const uniqueName = `${crypto.randomUUID()}.${extension}`;

        const uploadParams = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: uniqueName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await r2Client.send(new PutObjectCommand(uploadParams));

        const urlBase = process.env.R2_PUBLIC_URL || `https://${process.env.R2_BUCKET_NAME}.r2.dev`;
        
        return {
            nombreArchivo: file.originalname,
            urlR2: `${urlBase}/${uniqueName}`,
            tipoArchivo: file.mimetype,
            keyR2: uniqueName
        };
    }
}