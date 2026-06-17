import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { RecursoModel } from '../../models/recursos/recursosModels.js';

// Cliente centralizado de R2
const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

export class RecursoService {
    static async generarUrlDescarga(id) {
        console.log(`⚙️ [Service] Procesando descarga para el recurso ID: ${id}`);

        // 1. Obtener datos desde el modelo (Base de datos)
        const recurso = await RecursoModel.obtenerPorId(id);
        
        if (!recurso) {
            throw new Error('El recurso solicitado no existe en la base de datos');
        }

        // CORRECCIÓN: Validamos usando la columna real 'key_r2'
        if (!recurso.key_r2) {
            throw new Error('El recurso no cuenta con una clave (key_r2) de almacenamiento válida');
        }

        // 2. Configurar el comando de descarga de S3/R2 usando 'key_r2'
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: recurso.key_r2,
            ResponseContentDisposition: `attachment; filename="${encodeURIComponent(recurso.nombre_archivo)}"`
        });

        // 3. Generar la URL firmada temporal
        const urlFirmada = await getSignedUrl(r2Client, command, { expiresIn: 60 });
        
        console.log(`✅ [Service] URL firmada generada exitosamente para: ${recurso.nombre_archivo}`);
        return urlFirmada;
    }
}