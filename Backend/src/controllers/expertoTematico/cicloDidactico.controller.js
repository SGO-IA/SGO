import { cicloService } from '../../services/expertoTematico/cicloDidacticoService.js';

export const cicloController = {
    async getDashboard(req, res) {
        try {
            const expertoId = req.user.id; 
            const data = await cicloService.getDashboardExperto(expertoId);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener dashboard', error: error.message });
        }
    },

    async getFases(req, res) {
        try {
            const data = await cicloService.getFasesProyecto();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener fases', error: error.message });
        }
    }
};