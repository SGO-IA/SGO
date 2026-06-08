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
            const { ova_id } = req.query;
            const ciclo = await cicloService.validarExistencia(ova_id);
            
            if (ciclo) {
                // Frontend espera: { existe: true, ciclo_id: number }
                res.status(200).json({ 
                    status: 'success', 
                    existe: true, 
                    ciclo_id: ciclo.id 
                });
            } else {
                res.status(200).json({ 
                    status: 'success', 
                    existe: false 
                });
            }
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    },

    async getCiclosPorOva(req, res) {
        try {
            const { ova_id } = req.params;
            const data = await cicloService.obtenerCiclosPorOva(ova_id);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    async guardarEtapa(req, res) {
        try {
            const cicloId = Number(req.params.cicloId);
            const payload = req.body;

            if (isNaN(cicloId) || cicloId <= 0) {
                return res.status(400).json({ status: 'error', message: 'ID de ciclo inválido.' });
            }

            const resultado = await cicloService.procesarGuardadoEtapa(cicloId, payload);
            
            return res.status(200).json({ 
                status: 'success', 
                message: 'Etapa guardada y recursos indexados', 
                data: resultado 
            });
        } catch (error) {
            console.error('❌ Error en guardarEtapa Controller:', error);
            return res.status(500).json({ status: 'error', message: 'Error interno en persistencia.' });
        }
    }
};