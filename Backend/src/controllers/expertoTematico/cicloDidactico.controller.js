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

    async obtenerEtapa(req, res) {
        try {
            const cicloId = Number(req.params.cicloId);
            const { tipo_etapa } = req.query; // Esperamos algo como ?tipo_etapa=Reflexion

            if (isNaN(cicloId) || cicloId <= 0 || !tipo_etapa) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'ID de ciclo y tipo de etapa son requeridos.' 
                });
            }

            const resultado = await cicloService.obtenerEtapaCompleta(cicloId, tipo_etapa);
            
            return res.status(200).json({ 
                status: 'success', 
                data: resultado 
            });
        } catch (error) {
            console.error('❌ Error en obtenerEtapa Controller:', error);
            return res.status(500).json({ 
                status: 'error', 
                message: 'Error interno al consultar la etapa.' 
            });
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
    },

    async deleteEnlace(req, res) {
        try {
            const { enlaceId } = req.params;
            
            // Llamamos al service para borrar
            await cicloService.eliminarEnlace(enlaceId);
            
            return res.status(200).json({ 
                status: 'success', 
                message: 'Enlace eliminado correctamente' 
            });
        } catch (error) {
            console.error('❌ Error en deleteEnlace Controller:', error);
            return res.status(500).json({ status: 'error', message: 'Error al eliminar el enlace.' });
        }
    },

    async getEstado(req, res) {
        try {
            const { cicloId } = req.params;

            console.log(`🎮 [Controller] Verificando estado del ciclo ID: ${cicloId}`);
            const estado = await cicloService.verificarEstadoCiclo(Number(cicloId));

            return res.status(200).json({ ok: true, data: estado });

        } catch (error) {
            console.error('❌ [Controller] Error verificando estado del ciclo:', error.message);
            return res.status(500).json({ ok: false, mensaje: error.message });
        }
    },

    // POST /ciclos/:cicloId/finalizar
    async finalizar(req, res) {
        try {
            const { cicloId } = req.params;

            console.log(`🎮 [Controller] Finalizando ciclo ID: ${cicloId}`);
            const resultado = await cicloService.finalizarCiclo(Number(cicloId));

            return res.status(200).json({
                ok: true,
                mensaje: 'Ciclo didáctico finalizado correctamente.',
                data: resultado
            });

        } catch (error) {
            console.error('❌ [Controller] Error al finalizar ciclo:', error.message);
            const status = error.message.includes('Faltan') || error.message.includes('etapas') ? 409 : 500;
            return res.status(status).json({ ok: false, mensaje: error.message });
        }
    }
};