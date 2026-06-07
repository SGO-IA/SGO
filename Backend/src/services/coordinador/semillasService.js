import { semillaModel } from '../../models/coordinador/semillasModels.js';
import db from '../../config/dbConfig.js';

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
    }
};