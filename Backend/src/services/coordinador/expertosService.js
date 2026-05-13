import { expertoModel } from '../../models/coordinador/expertosModels.js';

export const expertoService = {
    async getExpertosTematicos() {
        return await expertoModel.obtenerExpertos();
    }
};