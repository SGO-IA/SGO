import { coordinadorSelectoresModel } from '../../models/coordinador/selectoresModels.js';

export const coordinadorSelectoresService = {
    async listarFichas(programaId) {
        return await coordinadorSelectoresModel.getFichasDisponibles(programaId);
    },

    async listarInstructores() {
        return await coordinadorSelectoresModel.getInstructoresActivos();
    },

    async listarCompetencias(programaId) {
        return await coordinadorSelectoresModel.getCompetenciasPorPrograma(programaId);
    }
};