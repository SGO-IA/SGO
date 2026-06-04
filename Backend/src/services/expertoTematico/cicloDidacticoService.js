import { cicloModel } from '../../models/expertoTematico/cicloDidacticoModel.js';

export const cicloService = {
    async getDashboardExperto(expertoId) {
        return await cicloModel.obtenerDashboardPorExperto(expertoId);
    },

    async getFasesProyecto() {
        return await cicloModel.obtenerFases();
    }
};