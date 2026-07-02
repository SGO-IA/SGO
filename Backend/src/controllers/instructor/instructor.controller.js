import { instructorService } from '../../services/instructor/instructorService.js';

export const instructorController = {
    async getMisFichas(req, res) {
        try {
            const instructorId = req.user.id;
            const panel = await instructorService.obtenerPanelInstructor(instructorId);

            return res.status(200).json({
                ok: true,
                message: 'Panel del instructor cargado',
                data: panel
            });
        } catch (error) {
            console.error('❌ Error en getMisFichas (instructor):', error);
            return res.status(500).json({
                ok: false,
                message: 'Error interno al construir el panel del instructor.'
            });
        }
    },

        async getEstadisticas(req, res) {
        try {
            const { fichaId, competenciaId, ovaId } = req.params;

            const estadisticas = await instructorService.obtenerEstadisticasFichaCompetencia(
                fichaId, competenciaId, ovaId
            );

            return res.status(200).json({
                ok: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('❌ Error en getEstadisticas:', error);
            return res.status(500).json({
                ok: false,
                message: 'Error interno al construir las estadísticas.'
            });
        }
    }
};