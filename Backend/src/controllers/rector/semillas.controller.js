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
    },

    async detalleParaRevision(req, res) {
        try {
            const { id } = req.params;
            console.log(`🎮 [Controller] Obteniendo radiografía de la semilla ID: ${id}`);
            
            const detalleCompleto = await semillaRectorService.getDetalleRevision(Number(id));
            
            return res.status(200).json({
                ok: true,
                message: "Detalle de semilla obtenido correctamente",
                data: detalleCompleto
            });
        } catch (error) {
            console.error("❌ [Controller] Error en detalleParaRevision:", error);
            const status = error.message.includes('No se encontró') ? 404 : 500;
            return res.status(status).json({ 
                ok: false,
                message: "Error al obtener los detalles de la semilla", 
                error: error.message 
            });
        }
    },

    async getOvasPorSemilla(req, res) {
        try {
            const { semillaId } = req.params;
            const ovas = await semillaRectorService.listarOvasDeSemilla(Number(semillaId));
            return res.status(200).json({ ok: true, data: ovas });
        } catch (error) {
            const status = error.message.includes('No se encontraron') ? 404 : 500;
            return res.status(status).json({ ok: false, message: error.message });
        }
    },

    async getCiclosPorOva(req, res) {
        try {
            const { ovaId } = req.params;
            const ciclos = await semillaRectorService.listarCiclosDeOva(Number(ovaId));
            return res.status(200).json({ ok: true, data: ciclos });
        } catch (error) {
            const status = error.message.includes('No se encontraron') ? 404 : 500;
            return res.status(status).json({ ok: false, message: error.message });
        }
    },

    async getModoLecturaCiclo(req, res) {
        try {
            const { cicloId } = req.params;
            const lecturaCompleta = await semillaRectorService.armarModoLecturaCiclo(Number(cicloId));
            return res.status(200).json({ ok: true, data: lecturaCompleta });
        } catch (error) {
            const status = error.message.includes('no existe') ? 404 : 500;
            return res.status(status).json({ ok: false, message: error.message });
        }
    }
};