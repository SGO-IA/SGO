import { iaService } from '../../services/admin/testInicialesServices.js';

export const iaController = {
    obtenerProgramasConCompetencias: async (req, res) => {
        try {
            const programas = await iaService.listarProgramasYCompetencias();
            res.json(programas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    obtenerEstructuraCompletaCompetencia: async (req, res) => {
        try {
            const { id } = req.params;
            const estructura = await iaService.obtenerDetalleParaIA(id);
            res.json(estructura);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    consultarTestCompetencia: async (req, res) => {
        try {
            const { competenciaId } = req.params;
            const resultado = await iaService.verificarExistenciaTest(competenciaId);
            
            if (!resultado) {
                return res.status(200).json({ 
                    existe: false, 
                    mensaje: 'No se encontró un test para esta competencia.' 
                });
            }

            res.status(200).json({ 
                existe: true, 
                data: resultado 
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al consultar el test' });
        }
    },

    generarNuevoTest: async (req, res) => {
        try {
            const { competenciaId } = req.body;
            console.log("📥 Body recibido en Controller:", req.body);

            if (!competenciaId) {
                return res.status(400).json({ ok: false, mensaje: 'ID requerido' });
            }

            const resultado = await iaService.generarTestTecnico(req.body);

            if (!resultado.ok) {
                return res.status(500).json({ 
                    ok: false, 
                    mensaje: 'La IA no pudo generar el contenido.' 
                });
            }

            // Devolvemos el contenido generado para que el experto lo previsualice
            res.status(200).json({
                ok: true,
                mensaje: 'Test generado exitosamente por Claude',
                data: resultado.content, // Aquí viene el JSON de las preguntas
                usoTokens: resultado.usage
            });

        } catch (error) {
            console.error('❌ Error en generarNuevoTest:', error);
            res.status(500).json({ 
                ok: false, 
                error: 'Error crítico al procesar el test con la IA' 
            });
        }
    }
};