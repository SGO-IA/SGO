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
    },

    async crear(req, res) {
        try {
            const nuevoCiclo = await cicloService.registrarNuevoCiclo(req.body);
            res.status(201).json({ status: 'success', data: nuevoCiclo });
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    },
    
    async verificar(req, res) {
        try {
            const { ova_id, fase_proyecto_id } = req.query;
            const existe = await cicloService.validarExistencia(ova_id, fase_proyecto_id);
            res.status(200).json({ status: 'success', existe });
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
};