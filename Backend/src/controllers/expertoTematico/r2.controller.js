import { MaterialService } from '../../services/expertoTematico/r2Services.js';
export class materialController {
    static async uploadRecurso(req, res) {
        try {
            const file = req.file;

            if (!file) {
                return res.status(400).json({ status: false, message: 'Archivo no proporcionado.' });
            }

            // Subimos a R2 y obtenemos la metadata (sin guardar en BD aún)
            const recursoSubido = await MaterialService.uploadToR2(file);

            return res.status(201).json({
                status: true,
                message: 'Recurso subido a Cloudflare R2.',
                data: recursoSubido
            });
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }
}