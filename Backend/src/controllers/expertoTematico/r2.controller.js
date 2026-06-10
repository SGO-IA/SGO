import { MaterialService } from '../../services/expertoTematico/r2Services.js';
import { cicloModel } from '../../models/expertoTematico/cicloDidacticoModel.js';
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

static async deleteRecurso(req, res) {
    try {
        const { recursoId } = req.params;
        const recurso = await cicloModel.obtenerRecursoPorId(recursoId);
        
        if (!recurso) return res.status(404).json({ message: 'No encontrado' });

        // ✅ DEPURACIÓN: Verifica qué tiene el objeto antes de enviarlo a R2
        console.log("DEBUG Recurso obtenido:", recurso);
        
        // Probablemente el campo se llama 'key_r2' y no 'keyR2'
        const keyToDelete = recurso.key_r2 || recurso.keyR2;

        if (!keyToDelete) {
             return res.status(500).json({ status: false, message: 'La llave (Key) del archivo es nula en BD.' });
        }

        await MaterialService.deleteFromR2(keyToDelete);
        await cicloModel.eliminarRecurso(recursoId);

        return res.status(200).json({ status: true, message: 'Recurso eliminado.' });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}
}