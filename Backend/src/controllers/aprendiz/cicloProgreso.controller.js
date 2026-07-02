import { cicloProgresoService } from '../../services/aprendiz/cicloProgresoService.js';

export const cicloProgresoController = {
    async finalizarCiclo(req, res) {
        try {
            const aprendizId = req.user.id;
            const { cicloId } = req.params;

            const resultado = await cicloProgresoService.validarYFinalizarCiclo(aprendizId, cicloId);

            return res.status(200).json({ ok: true, data: resultado });
        } catch (error) {
            if (error.message === 'CICLO_INCOMPLETO') {
                return res.status(422).json({
                    ok: false,
                    error: 'CICLO_INCOMPLETO',
                    message: 'Debes aprobar los tests pendientes antes de finalizar este ciclo.',
                    pendientes: error.pendientes
                });
            }

            console.error('Error finalizando ciclo:', error);
            return res.status(500).json({ ok: false, error: 'Error interno al finalizar el ciclo.' });
        }
    }
};