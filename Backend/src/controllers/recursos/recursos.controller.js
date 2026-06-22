import { RecursoService } from '../../services/recursos/r2_service.js';

export const recursoController = {
    async verificarArchivo(req, res) {
        try {
            const { id } = req.params;
            const existe = await RecursoService.verificarExistencia(id);
            return existe ? res.status(200).send() : res.status(404).send();
        } catch (error) {
            return res.status(500).send();
        }
    },
    async descargarArchivo(req, res) {
        try {
            const { id } = req.params;
            console.log(`🎮 [Controller] Solicitud para descargar recurso ID: ${id}`);

            // Invocar la lógica del servicio
            const urlDescargaSegura = await RecursoService.generarUrlDescarga(id);
            
            // Redireccionar al usuario directamente a Cloudflare R2 de forma transparente
            return res.redirect(urlDescargaSegura);

        } catch (error) {
            console.error("❌ [Controller] Error en descargarArchivo:", error);
            
            // Si el error es porque no existía el archivo (404) o error interno (500)
            const status = error.message.includes('no existe') ? 404 : 500;
            
            return res.status(status).json({ 
                ok: false,
                message: "Error al procesar la descarga del recurso", 
                error: error.message 
            });
        }
    }
};