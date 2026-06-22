import { semillaModel } from '../../models/coordinador/semillasModels.js';
import db from '../../config/dbConfig.js';
import bcrypt from 'bcrypt';

export const semillaService = {
    async crearNuevaSemillaConExpertos({ programa_id, nombre_semilla, expertos }) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Insertamos la cabecera de la semilla (Programa de formación)
            const semillaId = await semillaModel.insertarSemilla(connection, { programa_id, nombre_semilla });

            // Usamos un Set para identificar las competencias únicas asociadas
            const competenciasUnicas = new Set();

            // 2. Vinculamos expertos y competencias
            for (const [expertoIdStr, competenciasIds] of Object.entries(expertos)) {
                const expertoId = parseInt(expertoIdStr, 10);

                for (const competenciaId of competenciasIds) {
                    competenciasUnicas.add(competenciaId);

                    await semillaModel.vincularExpertoACompetencia(connection, {
                        experto_id: expertoId,
                        semilla_id: semillaId,
                        competencia_id: competenciaId
                    });
                }
            }

            // Validación preventiva por si llega el objeto de expertos vacío
            if (competenciasUnicas.size === 0) {
                throw new Error("Debe asociar al menos una competencia para poder estructurar los OVA de la semilla.");
            }

            // 3. CREACIÓN DE LOS OVA MAESTROS (Límite del flujo del Coordinador)
            // Cada competencia única se registra como un Objeto Virtual de Aprendizaje (OVA) base
            for (const competenciaId of competenciasUnicas) {
                await semillaModel.insertarOvaEstructura(connection, {
                    semilla_id: semillaId,
                    competencia_id: competenciaId,
                    titulo: `OVA - Competencia [ID: ${competenciaId}]`
                });
            }

            // Confirmamos la transacción solo con la estructura de semillas, vínculos y ovas
            await connection.commit();
            return { semillaId };

        } catch (error) {
            // Si algo falla, revertimos para no dejar datos huérfanos
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async listarSemillasPedagogicas() {
        return await semillaModel.obtenerListaSemillas();
    },

    async construirArbolCompleto(semillaId) {
        const [semillaBase, expertos] = await Promise.all([
            semillaModel.obtenerBasePorId(semillaId),
            semillaModel.obtenerExpertosPorSemilla(semillaId)
        ]);

        if (!semillaBase) return null;

        const arbolSemilla = {
            ...semillaBase,
            expertos,
            ovas: []
        };

        const ovas = await semillaModel.obtenerOvasPorSemilla(semillaId);

        // Mantenemos la lectura completa del árbol intacta. Cuando la semilla sea nueva, 
        // "ciclos" retornará vacío de forma natural hasta que el experto los cree manualmente.
        for (let ova of ovas) {
            const nodoOva = { ...ova, ciclos: [] };
            const ciclos = await semillaModel.obtenerCiclosPorOva(ova.ova_id);

            for (let ciclo of ciclos) {
                const [raps, secciones] = await Promise.all([
                    semillaModel.obtenerRapsPorCiclo(ciclo.ciclo_id),
                    semillaModel.obtenerSeccionesPorCiclo(ciclo.ciclo_id)
                ]);

                for (let rap of raps) {
                    const componentes = await semillaModel.obtenerComponentesRap(rap.rap_id);
                    rap.conocimientos_saber = componentes.saberes;
                    rap.conocimientos_proceso = componentes.procesos;
                    rap.criterios_evaluacion = componentes.criterios;
                }

                nodoOva.ciclos.push({
                    ...ciclo,
                    resultados_aprendizaje: raps,
                    secciones
                });
            }

            arbolSemilla.ovas.push(nodoOva);
        }

        return arbolSemilla;
    },

    async obtenerBanco() {
        return await semillaModel.obtenerBanco();
    },

    // ─── Duplicación completa en una sola transacción ────────────────────────
    async duplicarSemilla({ semillaOrigenId, fichaId, instructores, correosAprendices }) {

        // ── Validaciones previas (sin transacción aún) ───────────────────────
        const semillaOrigen = await semillaModel.obtenerPorId(semillaOrigenId);
        if (!semillaOrigen) {
            throw new Error('La semilla origen no existe.');
        }
        if (semillaOrigen.estado !== 'aprobada') {
            throw new Error('Solo se pueden duplicar semillas aprobadas.');
        }
        if (semillaOrigen.semilla_origen_id !== null) {
            throw new Error('No se puede duplicar una copia, solo semillas originales.');
        }

        const ficha = await semillaModel.obtenerFicha(fichaId);
        if (!ficha) {
            throw new Error('La ficha destino no existe.');
        }
        if (ficha.programa_id !== semillaOrigen.programa_id) {
            throw new Error('La ficha y la semilla deben pertenecer al mismo programa.');
        }
        const yaVinculada = await semillaModel.fichaYaTieneSemilla(fichaId);
        if (yaVinculada) {
            throw new Error('La ficha ya tiene una semilla vinculada.');
        }

        // ── Transacción ──────────────────────────────────────────────────────
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // 1. Crear la semilla copia
            const nuevaSemillaId = await semillaModel.insertarSemillaCopia(conn, {
                programaId:      semillaOrigen.programa_id,
                nombreSemilla:   semillaOrigen.nombre_semilla,
                semillaOrigenId: semillaOrigenId,
                fichaId:         fichaId,
            });

            // 2. Duplicar OVAs → ciclos → secciones → recursos/enlaces/tests
            const ovas = await semillaModel.obtenerOvasDeSemilla(semillaOrigenId);

            for (const ova of ovas) {
                const nuevoOvaId = await semillaModel.insertarOva(conn, {
                    semillaId:    nuevaSemillaId,
                    competenciaId: ova.competencia_id,
                    titulo:       ova.titulo,
                    descripcion:  ova.descripcion,
                    activo:       ova.activo,
                    estado:       ova.estado,
                });

                const ciclos = await semillaModel.obtenerCiclosDeOva(ova.id);
                for (const ciclo of ciclos) {
                    const nuevoCicloId = await semillaModel.insertarCiclo(conn, {
                        ovaId:             nuevoOvaId,
                        faseProyectoId:    ciclo.fase_proyecto_id,
                        titulo:            ciclo.titulo,
                        descripcionGeneral: ciclo.descripcion_general,
                        orden:             ciclo.orden,
                        estado:            ciclo.estado,
                    });

                    const secciones = await semillaModel.obtenerSeccionesDeCiclo(ciclo.id);
                    for (const seccion of secciones) {
                        const nuevaSeccionId = await semillaModel.insertarSeccion(conn, {
                            cicloId:      nuevoCicloId,
                            tipoSeccion:  seccion.tipo_seccion,
                            titulo:       seccion.titulo,
                            contenidoHtml: seccion.contenido_html,
                            orden:        seccion.orden,
                        });

                        // Recursos R2 (apuntan al mismo archivo, no se copia físicamente)
                        const recursos = await semillaModel.obtenerRecursosDeSeccion(seccion.id);
                        for (const r of recursos) {
                            await semillaModel.insertarRecurso(conn, {
                                seccionId:     nuevaSeccionId,
                                nombreArchivo: r.nombre_archivo,
                                urlR2:         r.url_r2,
                                tipoArchivo:   r.tipo_archivo,
                                keyR2:         r.keyR2,
                                key_r2:        r.key_r2,
                            });
                        }

                        // Enlaces
                        const enlaces = await semillaModel.obtenerEnlacesDeSeccion(seccion.id);
                        for (const e of enlaces) {
                            await semillaModel.insertarEnlace(conn, {
                                seccionId: nuevaSeccionId,
                                url:       e.url,
                                etiqueta:  e.etiqueta,
                            });
                        }

                        // Tests IA
                        const tests = await semillaModel.obtenerTestsDeSeccion(seccion.id);
                        for (const t of tests) {
                            await semillaModel.insertarTest(conn, {
                                seccionId:    nuevaSeccionId,
                                nombreTest:   t.nombre_test,
                                ponderacion:  t.ponderacion,
                                preguntasJson: t.preguntas_json,
                            });
                        }
                    }
                }
            }

            // 3. Vincular la ficha a la nueva semilla
            await semillaModel.actualizarSemillaEnFicha(conn, {
                fichaId,
                semillaId: nuevaSemillaId,
            });

            // 4. Vincular instructores
            for (const inst of instructores) {
                await semillaModel.vincularInstructor(conn, {
                    instructorId:  inst.instructorId,
                    fichaId:       fichaId,
                    competenciaId: inst.competenciaId,
                });
            }

            // 5. Procesar aprendices: crear cuenta si no existe, matricular siempre
            const resultadosAprendices = [];

            for (const correo of correosAprendices) {
                const usuarioExistente = await semillaModel.obtenerUsuarioPorCorreo(correo);

                if (usuarioExistente) {
                    // Ya existe → solo matricular
                    await semillaModel.matricularAprendiz(conn, {
                        aprendizId: usuarioExistente.id,
                        fichaId,
                    });
                    resultadosAprendices.push({
                        correo,
                        accion: 'matriculado',
                        nombre: usuarioExistente.nombre,
                    });
                } else {
                    // No existe → crear cuenta con contraseña temporal
                    const contrasenaTemp  = generarContrasenaTemp();
                    const contrasenaHash  = await bcrypt.hash(contrasenaTemp, 10);
                    const nombre          = correo.split('@')[0];

                    const nuevoId = await semillaModel.crearUsuarioAprendiz(conn, {
                        nombre,
                        correo,
                        contrasena: contrasenaHash,
                    });
                    await semillaModel.matricularAprendiz(conn, {
                        aprendizId: nuevoId,
                        fichaId,
                    });
                    resultadosAprendices.push({
                        correo,
                        accion:        'creado_y_matriculado',
                        nombre,
                        contrasenaTemp, // el controller lo usa para enviar el correo
                    });
                }
            }

            await conn.commit();

            return {
                nuevaSemillaId,
                fichaId,
                aprendices: resultadosAprendices,
            };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },


};

// ─── Helpers privados ────────────────────────────────────────────────────────
function generarContrasenaTemp(longitud = 10) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    return Array.from({ length: longitud }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join('');
}