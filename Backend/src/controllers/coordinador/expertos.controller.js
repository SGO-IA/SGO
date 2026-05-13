import { expertoService } from '../../services/coordinador/expertosService.js';

export const expertoController = {
    async listarExpertos(req, res) {
        try {
            const expertos = await expertoService.getExpertosTematicos();
            return res.status(200).json(expertos);
        } catch (error) {
            return res.status(500).json({ 
                message: "Error al obtener la lista de expertos", 
                error: error.message 
            });
        }
    }
};