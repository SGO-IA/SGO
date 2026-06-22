import { semillaService } from '../../services/coordinador/semillasService.js';

export const semillaController = {
    async crearSemillaCompleta(req, res) {
        try {
            const { programa_id, nombre_semilla, expertos } = req.body;

            // Validación rápida de parámetros obligatorios
            if (!programa_id || !nombre_semilla || !expertos || Object.keys(expertos).length === 0) {
                return res.status(400).json({ 
                    message: "Faltan datos obligatorios para crear la semilla y sus asignaciones." 
                });
            }

            // Orquestamos la creación mediante el servicio
            const resultado = await semillaService.crearNuevaSemillaConExpertos({
                programa_id,
                nombre_semilla,
                expertos
            });

            return res.status(201).json({
                message: "Semilla pedagógica creada y expertos vinculados con éxito.",
                semillaId: resultado.semillaId
            });

        } catch (error) {
            return res.status(500).json({
                message: "Error en el servidor al registrar la semilla pedagógica",
                error: error.message
            });
        }
    },

    async obtenerTodasLasSemillas(req, res) {
        try {
            // Solicitamos la lista de semillas ya formateada al servicio
            const semillas = await semillaService.listarSemillasPedagogicas();

            return res.status(200).json(semillas);
        } catch (error) {
            console.error("Error en obtenerTodasLasSemillas:", error);
            return res.status(500).json({
                message: "Error en el servidor al recuperar el listado de semillas.",
                error: error.message
            });
        }
    },

    async obtenerDetalleSemilla(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'El ID de la semilla proporcionado no es válido.' 
                });
            }

            const detalleCompleto = await semillaService.construirArbolCompleto(Number(id));

            if (!detalleCompleto) {
                return res.status(404).json({ 
                    status: 'error', 
                    message: 'La semilla solicitada no existe en el sistema.' 
                });
            }

            return res.status(200).json({
                status: 'success',
                data: detalleCompleto
            });

        } catch (error) {
            console.error('Error en semillaController -> obtenerDetalleSemilla:', error);
            return res.status(500).json({ 
                status: 'error', 
                message: 'Ocurrió un error interno al compilar la información de la semilla.' 
            });
        }
    },

    async obtenerBanco(req, res) {
        try {
            const banco = await semillaService.obtenerBanco();
            return res.status(200).json({ ok: true, data: banco });
        } catch (error) {
            console.error('❌ [Controller] obtenerBanco:', error);
            return res.status(500).json({ ok: false, message: 'Error al obtener el banco de semillas.' });
        }
    },

    async duplicarSemilla(req, res) {
        try {
            const { semillaOrigenId, fichaId, instructores, correosAprendices } = req.body;

            // ── Validación de body ───────────────────────────────────────────
            if (!semillaOrigenId || !fichaId) {
                return res.status(400).json({
                    ok: false,
                    message: 'semillaOrigenId y fichaId son obligatorios.',
                });
            }
            if (!Array.isArray(instructores) || instructores.length === 0) {
                return res.status(400).json({
                    ok: false,
                    message: 'Debes asignar al menos un instructor.',
                });
            }
            if (!Array.isArray(correosAprendices) || correosAprendices.length === 0) {
                return res.status(400).json({
                    ok: false,
                    message: 'Debes ingresar al menos un correo de aprendiz.',
                });
            }

            // Validar formato de instructores
            const instructoresValidos = instructores.every(
                i => i.instructorId && i.competenciaId
            );
            if (!instructoresValidos) {
                return res.status(400).json({
                    ok: false,
                    message: 'Cada instructor debe tener instructorId y competenciaId.',
                });
            }

            // Validar formato de correos
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const correosInvalidos = correosAprendices.filter(c => !emailRegex.test(c));
            if (correosInvalidos.length > 0) {
                return res.status(400).json({
                    ok: false,
                    message: `Correos con formato inválido: ${correosInvalidos.join(', ')}`,
                });
            }

            console.log(`🎮 [Controller] Duplicando semilla ${semillaOrigenId} → ficha ${fichaId}`);

            const resultado = await semillaService.duplicarSemilla({
                semillaOrigenId,
                fichaId,
                instructores,
                correosAprendices,
            });
            
            const creados      = resultado.resumen.filter(a => a.estado === 'creado_y_matriculado');
            const matriculados = resultado.resumen.filter(a => a.estado === 'matriculado');

            console.log(`✅ [Controller] Semilla duplicada con éxito.`);
            console.log(`   Aprendices nuevos: ${creados.length} | Existentes matriculados: ${matriculados.length}`);

            return res.status(201).json({
                ok: true,
                message: 'Semilla duplicada y ficha vinculada correctamente.',
                data: {
                    // Si necesitas enviar el ID de la nueva semilla, debes asegurarte que 
                    // semillaService lo esté devolviendo en el objeto final. 
                    // Por ahora, enviaremos solo el resumen que sabemos que existe.
                    resumenAprendices: {
                        total:        resultado.resumen.length,
                        creados:      creados.length,
                        matriculados: matriculados.length,
                    },
                },
            });

        } catch (error) {
            console.error('❌ [Controller] duplicarSemilla:', error);

            const erroresConocidos = [
                'La semilla origen no existe.',
                'Solo se pueden duplicar semillas aprobadas.',
                'No se puede duplicar una copia, solo semillas originales.',
                'La ficha destino no existe.',
                'La ficha y la semilla deben pertenecer al mismo programa.',
                'La ficha ya tiene una semilla vinculada.',
            ];

            const esErrorNegocio = erroresConocidos.includes(error.message);
            return res.status(esErrorNegocio ? 400 : 500).json({
                ok: false,
                message: esErrorNegocio
                    ? error.message
                    : 'Error interno al duplicar la semilla.',
            });
        }
    },
};