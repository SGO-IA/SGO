import { cicloModel } from '../../models/expertoTematico/cicloDidacticoModel.js';

export const cicloService = {
    async getDashboardExperto(expertoId) {
        return await cicloModel.obtenerDashboardPorExperto(expertoId);
    },

    async getFasesProyecto() {
        return await cicloModel.obtenerFases();
    },

    async registrarNuevoCiclo(data) {
        // Aquí podrías agregar validaciones extra antes de persistir
        if (!data.ova_id || !data.fase_proyecto_id) {
            throw new Error("Faltan datos obligatorios para el ciclo");
        }
        return await cicloModel.crearCiclo(data);
    }
};