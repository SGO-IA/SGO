import { MaterialService } from '../../services/expertoTematico/r2Services.js';

export class MaterialController {
    static async uploadRecurso(req, res) {
        try {
            // HARDCODE TEMPORAL: Forzamos que siempre apunte a la sección 1 para pruebas locales
            const seccionId = 1; 
            const file = req.file;

            // Validaciones de entrada
            if (!seccionId) {
                return res.status(400).json({ status: false, message: 'El ID de la sección es obligatorio.' });
            }
            if (!file) {
                return res.status(400).json({ status: false, message: 'No se ha proporcionado ningún archivo para subir.' });
            }

            // Orquestación en la capa de servicio (con el ID controlado)
            const nuevoRecurso = await MaterialService.saveRecursoSeccion(seccionId, file);

            return res.status(201).json({
                status: true,
                message: 'Recurso subido a Cloudflare R2 y registrado en BD con éxito (Modo Test: Sección 1)',
                data: nuevoRecurso
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message
            });
        }
    }
}