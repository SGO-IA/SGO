import { cicloProgresoModel } from '../../models/aprendiz/cicloProgresoModel.js';

export const cicloProgresoService = {
    /**
     * Valida que el aprendiz haya aprobado todos los tests obligatorios
     * del ciclo (Apropiación y Transferencia, solo si tienen test configurado).
     * Si pasa, marca el ciclo como completado.
     */
    async validarYFinalizarCiclo(aprendizId, cicloId) {
        const testsObligatorios = await cicloProgresoModel.obtenerTestsObligatoriosDelCiclo(cicloId);

        // Si el instructor no configuró tests en ninguna fase, no hay nada que validar
        if (testsObligatorios.length === 0) {
            await cicloProgresoModel.marcarCicloCompletado(aprendizId, cicloId);
            return { completado: true, pendientes: [] };
        }

        const pendientes = [];

        for (const test of testsObligatorios) {
            const resultado = await cicloProgresoModel.obtenerUltimoResultadoTest(aprendizId, test.test_id);

            const aprobado = resultado && resultado.aprobado === 1;

            if (!aprobado) {
                pendientes.push({
                    fase: test.tipo_seccion,
                    nombre_test: test.nombre_test,
                    intentado: !!resultado,
                    puntaje: resultado ? resultado.puntaje : null
                });
            }
        }

        if (pendientes.length > 0) {
            const error = new Error('CICLO_INCOMPLETO');
            error.pendientes = pendientes;
            throw error;
        }

        await cicloProgresoModel.marcarCicloCompletado(aprendizId, cicloId);
        return { completado: true, pendientes: [] };
    },

    async obtenerProgresoCiclo(aprendizId, cicloId) {
        return await cicloProgresoModel.obtenerProgresoCiclo(aprendizId, cicloId);
    }
};