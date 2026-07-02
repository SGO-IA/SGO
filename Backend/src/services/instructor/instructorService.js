import { instructorModel } from '../../models/instructor/instructorModel.js';

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
    }
};