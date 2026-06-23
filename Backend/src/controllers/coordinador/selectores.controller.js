import { coordinadorSelectoresService } from '../../services/coordinador/selectoresService.js';

export const selectoresController = {
    async getFichas(req, res) {
        try {
            const { programaId } = req.query;
            console.log("Buscando fichas para el programa_id:", programaId); // 👈 Revisa la consola de Node
            
            // 🔥 Si no llega programaId, fallará silenciosamente
            if (!programaId) {
                 return res.status(400).json({ message: "programaId es requerido" });
            }

            const fichas = await coordinadorSelectoresService.listarFichas(programaId);
            return res.status(200).json(fichas);
        } catch (error) {
            console.error("Error cargando fichas:", error);
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
    },

    async getFichasConAprendices(req, res) {
        try {
            
            const listadoEstructurado = await coordinadorSelectoresService.listarFichasConSusAprendices();

            return res.status(200).json({
                ok: true,
                message: 'Listado de fichas y aprendices recuperado con éxito.',
                data: listadoEstructurado
            });

        } catch (error) {
            console.error('❌ [Controller] Error en getFichasConAprendices:', error);
            return res.status(500).json({
                ok: false,
                message: 'Error interno al obtener las fichas y aprendices.'
            });
        }
    },

    async crearFicha(req, res) {
        try {
            const { 
                codigo_ficha, ficha_caracterizacion, programa_id, 
                centro_id, fecha_inicio, fecha_fin, modalidad, 
                correosAprendices 
            } = req.body;

            // ─── VALIDACIONES ───
            if (!codigo_ficha || !ficha_caracterizacion || !programa_id || !centro_id || !fecha_inicio || !fecha_fin || !modalidad) {
                return res.status(400).json({ ok: false, message: 'Faltan campos obligatorios para crear la ficha.' });
            }

            if (!Array.isArray(correosAprendices) || correosAprendices.length === 0) {
                return res.status(400).json({ ok: false, message: 'Debes ingresar al menos un correo de aprendiz.' });
            }

            // Limpiar y validar correos con regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const correosValidos = correosAprendices.map(c => c.trim().toLowerCase());
            const correosInvalidos = correosValidos.filter(c => !emailRegex.test(c));

            if (correosInvalidos.length > 0) {
                return res.status(400).json({ 
                    ok: false, 
                    message: `Existen correos con formato inválido: ${correosInvalidos.join(', ')}` 
                });
            }

            // ─── EJECUCIÓN ───
            console.log(`🎮 [Controller] Creando ficha ${codigo_ficha} y matriculando ${correosValidos.length} aprendices...`);
            
            const resultado = await coordinadorSelectoresService.crearFichaYMatricular({
                codigo_ficha, ficha_caracterizacion, programa_id, centro_id, fecha_inicio, fecha_fin, modalidad
            }, correosValidos);

            return res.status(201).json({
                ok: true,
                message: 'Ficha creada y aprendices matriculados exitosamente.',
                data: resultado
            });

        } catch (error) {
            console.error('❌ [Controller] Error en crearFicha:', error);
            // Capturar error de llaves duplicadas de MySQL (Ej: el codigo_ficha ya existe)
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ ok: false, message: 'El código de ficha o caracterización ya se encuentra registrado en el sistema.' });
            }
            return res.status(500).json({ ok: false, message: 'Error interno al crear la ficha.' });
        }
    },

    async getProgramas(req, res) {
        try {
            const data = await coordinadorSelectoresService.obtenerProgramas();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener programas" });
        }
    },
    async getCentros(req, res) {
        try {
            const data = await coordinadorSelectoresService.obtenerCentros();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener centros" });
        }
    }
};