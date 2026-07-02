// services/r2Services.js
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

    static async deleteFromR2(key) {
        const deleteParams = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key, // Esta es la 'keyR2' (el nombre único del archivo)
        };
        // Esto borra el archivo físicamente de Cloudflare
        await r2Client.send(new DeleteObjectCommand(deleteParams));
    }

    static async generarUrlDescarga(key, nombreArchivoOriginal) {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ResponseContentDisposition: `attachment; filename="${nombreArchivoOriginal}"`,
        });

        // La URL firmada expira en 5 minutos — tiempo de sobra para iniciar la descarga
        const url = await getSignedUrl(r2Client, command, { expiresIn: 300 });
        return url;
    }
}