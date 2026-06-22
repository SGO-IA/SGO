import { coordinadorSelectoresService } from '../../services/coordinador/selectoresService.js';

export const selectoresController = {
    async getFichas(req, res) {
        try {
            // Viene de /api/coordinador/fichas?programaId=1&sinSemilla=true
            const { programaId } = req.query; 
            const fichas = await coordinadorSelectoresService.listarFichas(programaId);
            return res.status(200).json(fichas); // El frontend espera el array directo
        } catch (error) {
            return res.status(500).json({ message: "Error cargando fichas", error: error.message });
        }
    },

    async getInstructores(req, res) {
        try {
            const instructores = await coordinadorSelectoresService.listarInstructores();
            return res.status(200).json(instructores);
        } catch (error) {
            return res.status(500).json({ message: "Error cargando instructores", error: error.message });
        }
    },

    async getCompetencias(req, res) {
        try {
            // Viene de /api/coordinador/programas/:programaId/competencias
            const { programaId } = req.params; 
            const competencias = await coordinadorSelectoresService.listarCompetencias(programaId);
            return res.status(200).json(competencias);
        } catch (error) {
            return res.status(500).json({ message: "Error cargando competencias", error: error.message });
        }
    }
};