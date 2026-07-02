import { instructorModel } from '../../models/instructor/instructorModel.js';
import { anthropic, anthropicConfig } from '../../config/claude.js';

export const instructorService = {
    /**
     * Agrupa las filas planas del model en un árbol:
     * Ficha -> [Competencias -> OVA asociada]
     * Igual patrón que usas en aprendizService con seccionesMap.
     */
    async obtenerPanelInstructor(instructorId) {
        const filas = await instructorModel.obtenerVinculacionesInstructor(instructorId);

        const fichasMap = {};

        filas.forEach(row => {
            // 1. Agrupamos por ficha
            if (!fichasMap[row.ficha_id]) {
                fichasMap[row.ficha_id] = {
                    ficha_id: row.ficha_id,
                    codigo_ficha: row.codigo_ficha,
                    ficha_caracterizacion: row.ficha_caracterizacion,
                    estado_ficha: row.estado_ficha,
                    fecha_inicio: row.fecha_inicio,
                    fecha_fin: row.fecha_fin,
                    modalidad: row.modalidad,
                    programa: {
                        id: row.programa_id,
                        codigo: row.programa_codigo,
                        nombre: row.programa_nombre,
                        version: row.programa_version,
                        nivel_formacion: row.nivel_formacion
                    },
                    centro: {
                        id: row.centro_id,
                        nombre_centro: row.nombre_centro,
                        regional: row.regional
                    },
                    semilla: row.semilla_id ? {
                        id: row.semilla_id,
                        nombre_semilla: row.nombre_semilla,
                        estado: row.estado_semilla
                    } : null,
                    competencias: []
                };
            }

            // 2. Evitamos duplicar la misma competencia dentro de la misma ficha
            const yaExiste = fichasMap[row.ficha_id].competencias.some(
                c => c.id === row.competencia_id
            );

            if (!yaExiste) {
                fichasMap[row.ficha_id].competencias.push({
                    id: row.competencia_id,
                    codigo_norma: row.codigo_norma,
                    nombre: row.competencia_nombre,
                    horas: row.horas,
                    ova: row.ova_id ? {
                        id: row.ova_id,
                        titulo: row.ova_titulo,
                        estado: row.ova_estado,
                        activo: !!row.ova_activo
                    } : null // null significa: aún no se ha creado la OVA para esta competencia
                });
            }
        });

        return Object.values(fichasMap);
    },

        /**
     * Construye el dashboard estadístico completo para una ficha+competencia:
     * lista de aprendices con su avance real por ciclo y sus resultados de tests.
     */
    async obtenerEstadisticasFichaCompetencia(fichaId, competenciaId, ovaId) {
        // 1. Estructura de la OVA: ciclos + tests que la componen
        const estructuraRaw = await instructorModel.obtenerEstructuraOva(ovaId);

        const ciclosMap = {};
        estructuraRaw.forEach(row => {
            if (!ciclosMap[row.ciclo_id]) {
                ciclosMap[row.ciclo_id] = {
                    id: row.ciclo_id,
                    titulo: row.ciclo_titulo,
                    orden: row.orden,
                    tests: []
                };
            }
            if (row.test_id && !ciclosMap[row.ciclo_id].tests.some(t => t.id === row.test_id)) {
                ciclosMap[row.ciclo_id].tests.push({
                    id: row.test_id,
                    nombre_test: row.nombre_test,
                    fase: row.tipo_seccion
                });
            }
        });
        const ciclos = Object.values(ciclosMap);
        const cicloIds = ciclos.map(c => c.id);
        const testIds = ciclos.flatMap(c => c.tests.map(t => t.id));

        // 2. Aprendices matriculados en la ficha
        const aprendices = await instructorModel.obtenerAprendicesPorFicha(fichaId);
        const aprendizIds = aprendices.map(a => a.id);

        // 3. Data cruzada: progreso, tests, diagnóstico
        const [progresoCiclos, resultadosTests, resultadosDiagnostico] = await Promise.all([
            instructorModel.obtenerProgresoCiclos(aprendizIds, cicloIds),
            instructorModel.obtenerResultadosTestsIA(aprendizIds, testIds),
            instructorModel.obtenerResultadosDiagnostico(aprendizIds, competenciaId)
        ]);

        // 4. Armamos el detalle por aprendiz
        const aprendicesDetalle = aprendices.map(aprendiz => {
            const cicloEstado = ciclos.map(ciclo => {
                const progreso = progresoCiclos.find(
                    p => p.aprendiz_id === aprendiz.id && p.ciclo_id === ciclo.id
                );

                const testsDelCiclo = ciclo.tests.map(test => {
                    const resultado = resultadosTests.find(
                        r => r.aprendiz_id === aprendiz.id && r.test_id === test.id
                    );
                    return {
                        test_id: test.id,
                        nombre_test: test.nombre_test,
                        fase: test.fase,
                        intentado: !!resultado,
                        puntaje: resultado ? parseFloat(resultado.puntaje) : null,
                        aprobado: resultado ? !!resultado.aprobado : false
                    };
                });

                return {
                    ciclo_id: ciclo.id,
                    titulo: ciclo.titulo,
                    completado: !!(progreso && progreso.completado),
                    fecha_completado: progreso ? progreso.fecha_completado : null,
                    tests: testsDelCiclo
                };
            });

            const totalCiclos = ciclos.length;
            const ciclosCompletados = cicloEstado.filter(c => c.completado).length;
            const porcentajeAvance = totalCiclos > 0 
                ? Math.round((ciclosCompletados / totalCiclos) * 100) 
                : 0;

            const diagnostico = resultadosDiagnostico.find(d => d.aprendiz_id === aprendiz.id) || null;

            // Promedio de puntajes de tests intentados (para detectar bajo rendimiento)
            const testsIntentados = cicloEstado.flatMap(c => c.tests).filter(t => t.intentado);
            const promedioPuntaje = testsIntentados.length > 0
                ? Math.round(testsIntentados.reduce((sum, t) => sum + t.puntaje, 0) / testsIntentados.length)
                : null;

            return {
                id: aprendiz.id,
                nombre: aprendiz.nombre,
                correo: aprendiz.correo,
                activo: !!aprendiz.activo,
                estado: ciclosCompletados === totalCiclos && totalCiclos > 0 
                    ? 'completado' 
                    : ciclosCompletados > 0 
                        ? 'en_progreso' 
                        : 'sin_iniciar',
                porcentajeAvance,
                ciclosCompletados,
                totalCiclos,
                promedioPuntaje,
                diagnostico: diagnostico ? {
                    puntaje: diagnostico.puntaje,
                    nivel_sugerido: diagnostico.nivel_sugerido
                } : null,
                ciclos: cicloEstado
            };
        });

        // 5. Métricas agregadas para los gráficos
        const totalAprendices = aprendicesDetalle.length;
        const completados = aprendicesDetalle.filter(a => a.estado === 'completado').length;
        const enProgreso = aprendicesDetalle.filter(a => a.estado === 'en_progreso').length;
        const sinIniciar = aprendicesDetalle.filter(a => a.estado === 'sin_iniciar').length;

        const puntajesValidos = aprendicesDetalle
            .filter(a => a.promedioPuntaje !== null)
            .map(a => a.promedioPuntaje);
        const promedioGeneral = puntajesValidos.length > 0
            ? Math.round(puntajesValidos.reduce((s, p) => s + p, 0) / puntajesValidos.length)
            : null;

        return {
            resumen: {
                totalAprendices,
                completados,
                enProgreso,
                sinIniciar,
                promedioGeneral
            },
            ciclos: ciclos.map(c => ({ id: c.id, titulo: c.titulo, tests: c.tests })),
            aprendices: aprendicesDetalle
        };
    },

    async generarAnalisisGrupal(fichaId, competenciaId, ovaId) {
    // 1. Estructura de la OVA (mismo patrón que ya usas en obtenerEstadisticasFichaCompetencia)
    const estructuraRaw = await instructorModel.obtenerEstructuraOva(ovaId);

    const ciclosMap = {};
    estructuraRaw.forEach(row => {
        if (!ciclosMap[row.ciclo_id]) {
            ciclosMap[row.ciclo_id] = { id: row.ciclo_id, titulo: row.ciclo_titulo, tests: [] };
        }
        if (row.test_id && !ciclosMap[row.ciclo_id].tests.some(t => t.id === row.test_id)) {
            ciclosMap[row.ciclo_id].tests.push({ id: row.test_id, nombre_test: row.nombre_test, fase: row.tipo_seccion });
        }
    });
    const ciclos = Object.values(ciclosMap);
    const testIds = ciclos.flatMap(c => c.tests.map(t => t.id));

    // 2. Aprendices y sus resultados con analisis_ia
    const aprendices = await instructorModel.obtenerAprendicesPorFicha(fichaId);
    const aprendizIds = aprendices.map(a => a.id);

    const [resultadosTests, resultadosDiagnostico] = await Promise.all([
        instructorModel.obtenerResultadosTestsIAConAnalisis(aprendizIds, testIds),
        instructorModel.obtenerResultadosDiagnosticoConAnalisis(aprendizIds, competenciaId)
    ]);

    if (!aprendizIds.length) {
        throw new Error('No hay aprendices matriculados en esta ficha para analizar.');
    }

    // 3. Resumen COMPACTO por aprendiz (solo lo que le sirve a la IA, nada de JSON crudo completo)
    const resumenAprendices = aprendices.map(aprendiz => {
        const testsDelAprendiz = resultadosTests
            .filter(r => r.aprendiz_id === aprendiz.id)
            .map(r => {
                const test = ciclos.flatMap(c => c.tests).find(t => t.id === r.test_id);
                let areasMejora = [];
                try {
                    const analisis = typeof r.analisis_ia === 'string' ? JSON.parse(r.analisis_ia) : r.analisis_ia;
                    areasMejora = analisis?.areas_mejora?.slice(0, 5) || [];
                } catch {
                    // si no se puede parsear, seguimos sin esas áreas puntuales
                }
                return {
                    fase: test?.fase,
                    nombre_test: test?.nombre_test,
                    puntaje: parseFloat(r.puntaje),
                    aprobado: !!r.aprobado,
                    areas_mejora: areasMejora
                };
            });

        const diag = resultadosDiagnostico.find(d => d.aprendiz_id === aprendiz.id);
        let diagAreas = [];
        if (diag) {
            try {
                const analisis = typeof diag.analisis_ia === 'string' ? JSON.parse(diag.analisis_ia) : diag.analisis_ia;
                diagAreas = analisis?.areas_mejora?.slice(0, 5) || [];
            } catch {
                // idem
            }
        }

        return {
            nombre: aprendiz.nombre,
            diagnostico: diag
                ? { puntaje: parseFloat(diag.puntaje), nivel: diag.nivel_sugerido, areas_mejora: diagAreas }
                : null,
            tests: testsDelAprendiz
        };
    });

    // 4. Prompt
    const prompt = `Eres un asistente pedagógico que ayuda a instructores del SENA a interpretar resultados de aprendizaje.

A continuación tienes el resumen de un grupo de aprendices. Cada uno tiene su diagnóstico inicial (punto de partida antes de la OVA) y sus resultados en los tests de Apropiación y Transferencia, incluyendo las áreas de mejora detectadas.

DATOS DEL GRUPO:
${JSON.stringify(resumenAprendices, null, 2)}

Con base en esta información, genera un análisis EXCLUSIVAMENTE en formato JSON (sin texto adicional antes o después, sin backticks de markdown) con esta estructura exacta:

{
  "resumen_general": "string, 2-3 frases sobre el estado general del grupo",
  "patrones_comunes": ["array de 2-5 strings, conceptos donde varios aprendices comparten dificultad"],
  "aprendices_prioritarios": [{"nombre": "string", "motivo": "string breve"}],
  "recomendacion_pedagogica": "string, sugerencia concreta y accionable para la próxima sesión del instructor"
}

No inventes datos que no estén en la información proporcionada. Si el grupo es muy pequeño o no hay suficientes datos para detectar patrones reales, dilo explícitamente en resumen_general.`;

    // 🔍 LOG de depuración: ver EXACTAMENTE qué se envía a la IA
    console.log('\n========== 🤖 PROMPT ENVIADO A CLAUDE (Análisis Grupal) ==========');
    console.log(prompt);
    console.log('====================================================================\n');

    const respuesta = await anthropic.messages.create({
        model: anthropicConfig.model,
        max_tokens: anthropicConfig.maxTokens,
        messages: [{ role: 'user', content: prompt }]
    });

    const textoRespuesta = respuesta.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

    console.log('========== 🤖 RESPUESTA CRUDA DE CLAUDE ==========');
    console.log(textoRespuesta);
    console.log('====================================================\n');

    let analisis;
    try {
        const limpio = textoRespuesta.replace(/```json|```/g, '').trim();
        analisis = JSON.parse(limpio);
    } catch (err) {
        console.error('❌ No se pudo parsear la respuesta de la IA como JSON:', err);
        throw new Error('La IA no devolvió un formato válido. Intenta de nuevo.');
    }

    return analisis;
}
};