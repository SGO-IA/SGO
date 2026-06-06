import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { MaterialModel } from '../../models/expertoTematico/r2Model.js';
import crypto from 'crypto';

// Inicialización del cliente compatible con S3 para R2
const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT, // Ej: https://<account_id>.r2.cloudflarestorage.com
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

export class MaterialService {
    static async saveRecursoSeccion(seccionId, file) {
        // 1. Generar un nombre único (UUID) para evitar colisiones en Cloudflare R2
        const extension = file.originalname.split('.').pop();
        const uniqueName = `${crypto.randomUUID()}.${extension}`;

        // 2. Configurar los parámetros de subida a Cloudflare
        const uploadParams = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: uniqueName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        // 3. Ejecutar comando de envío hacia el bucket de R2
        await r2Client.send(new PutObjectCommand(uploadParams));

        // 4. Construir la URL de acceso público / privado del recurso
        // Si usas el dominio público de R2 o uno propio mapeado en Cloudflare
        const urlBase = process.env.R2_PUBLIC_URL || `https://${process.env.R2_BUCKET_NAME}.r2.dev`;
        const urlCompletaR2 = `${urlBase}/${uniqueName}`;

        // 5. Mapear datos para persistirlos en la base de datos
        const dataModel = {
            seccionId: parseInt(seccionId),
            nombreArchivo: file.originalname,
            urlR2: urlCompletaR2,
            tipoArchivo: file.mimetype
        };

        const insertId = await MaterialModel.createRecurso(dataModel);

        return {
            id: insertId,
            ...dataModel,
            keyR2: uniqueName
        };
    }
}