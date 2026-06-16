import { semillaRectorService } from '../../services/rector/semillaService.js';

export const semillaRectorController = {
    async listarPendientes(req, res) {
        try {
            console.log(`🎮 [Controller] Solicitud para listar semillas pendientes del rector`);
            const semillas = await semillaRectorService.getSemillasParaRevision();
            
            return res.status(200).json({
                ok: true,
                message: "Semillas pendientes obtenidas correctamente",
                data: semillas
            });
        } catch (error) {
            console.error("❌ [Controller] Error en listarPendientes:", error);
            return res.status(500).json({ 
                ok: false,
                message: "Error al obtener las semillas para revisión", 
                error: error.message 
            });
        }
    }
};