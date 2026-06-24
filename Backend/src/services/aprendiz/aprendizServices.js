import { aprendizModel } from '../../models/aprendiz/aprendizModels.js';

export const aprendizService = {
    async listarMisFichas(aprendizId) {
        // Por ahora es un puente directo a la base de datos
        const misFichas = await aprendizModel.obtenerFichasPorAprendiz(aprendizId);
        return misFichas;
    }
};