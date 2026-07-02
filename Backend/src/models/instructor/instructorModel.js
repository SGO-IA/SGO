import db from '../../config/dbConfig.js';

export const instructorModel = {
    /**
     * Trae TODAS las vinculaciones del instructor: cada fila es
     * una combinación ficha + competencia, con la info de programa,
     * centro, semilla asociada, y la OVA (si ya existe) para esa
     * competencia dentro de esa semilla específica.
     */
    async obtenerVinculacionesInstructor(instructorId) {
        const query = `
            SELECT 
                -- Ficha
                f.id AS ficha_id, f.codigo_ficha, f.ficha_caracterizacion, 
                f.estado AS estado_ficha, f.fecha_inicio, f.fecha_fin, f.modalidad,

                -- Programa
                p.programa_id, p.codigo AS programa_codigo, p.nombre AS programa_nombre, 
                p.version AS programa_version, p.nivel_formacion,

                -- Centro de formación
                cf.id AS centro_id, cf.nombre_centro, cf.regional,

                -- Semilla vinculada a esta ficha (puede ser NULL si aún no se ha copiado ninguna)
                s.id AS semilla_id, s.nombre_semilla, s.estado AS estado_semilla,

                -- Competencia asignada al instructor en esta ficha
                c.id AS competencia_id, c.codigo_norma, c.nombre AS competencia_nombre, c.horas,

                -- OVA correspondiente a esa competencia, dentro de la semilla de esta ficha (si existe)
                o.id AS ova_id, o.titulo AS ova_titulo, o.estado AS ova_estado, o.activo AS ova_activo

            FROM vinculacion_instructores vi
            INNER JOIN fichas f ON vi.ficha_id = f.id
            INNER JOIN programas p ON f.programa_id = p.programa_id
            INNER JOIN centros_formacion cf ON f.centro_id = cf.id
            INNER JOIN competencias c ON vi.competencia_id = c.id
            LEFT JOIN semillas s ON f.semilla_id = s.id
            LEFT JOIN ovas o ON o.semilla_id = s.id AND o.competencia_id = c.id

            WHERE vi.instructor_id = ?
            ORDER BY f.fecha_inicio DESC, f.codigo_ficha ASC, c.codigo_norma ASC
        `;
        const [rows] = await db.execute(query, [instructorId]);
        return rows;
    },
        async obtenerEstructuraOva(ovaId) {
        const query = `
            SELECT 
                cd.id AS ciclo_id, cd.titulo AS ciclo_titulo, cd.orden,
                cs.id AS seccion_id, cs.tipo_seccion,
                t.id AS test_id, t.nombre_test
            FROM ciclos_didacticos cd
            LEFT JOIN ciclo_secciones cs ON cs.ciclo_id = cd.id AND cs.tipo_seccion IN ('Apropiacion', 'Transferencia')
            LEFT JOIN tests_ia t ON t.seccion_id = cs.id
            WHERE cd.ova_id = ?
            ORDER BY cd.orden ASC
        `;
        const [rows] = await db.execute(query, [ovaId]);
        return rows;
    },

    // 🚀 NUEVO: aprendices matriculados en la ficha
    async obtenerAprendicesPorFicha(fichaId) {
        const query = `
            SELECT u.id, u.nombre, u.correo, u.activo
            FROM matriculas_aprendices ma
            INNER JOIN usuarios u ON ma.aprendiz_id = u.id
            WHERE ma.ficha_id = ?
            ORDER BY u.nombre ASC
        `;
        const [rows] = await db.execute(query, [fichaId]);
        return rows;
    },

    // 🚀 NUEVO: progreso de ciclos de un conjunto de aprendices para ciclos específicos
    async obtenerProgresoCiclos(aprendizIds, cicloIds) {
        if (!aprendizIds.length || !cicloIds.length) return [];
        const placeholdersAp = aprendizIds.map(() => '?').join(',');
        const placeholdersCi = cicloIds.map(() => '?').join(',');
        const query = `
            SELECT aprendiz_id, ciclo_id, completado, fecha_completado
            FROM progreso_ciclos
            WHERE aprendiz_id IN (${placeholdersAp}) AND ciclo_id IN (${placeholdersCi})
        `;
        const [rows] = await db.execute(query, [...aprendizIds, ...cicloIds]);
        return rows;
    },

    // 🚀 NUEVO: últimos resultados de tests_ia por aprendiz+test (uno por combinación, el más reciente)
    async obtenerResultadosTestsIA(aprendizIds, testIds) {
        if (!aprendizIds.length || !testIds.length) return [];
        const placeholdersAp = aprendizIds.map(() => '?').join(',');
        const placeholdersTe = testIds.map(() => '?').join(',');
        const query = `
            SELECT r1.aprendiz_id, r1.test_id, r1.puntaje, r1.aprobado, r1.fecha_presentacion
            FROM resultados_tests_ia r1
            INNER JOIN (
                SELECT aprendiz_id, test_id, MAX(fecha_presentacion) AS ultima_fecha
                FROM resultados_tests_ia
                WHERE aprendiz_id IN (${placeholdersAp}) AND test_id IN (${placeholdersTe})
                GROUP BY aprendiz_id, test_id
            ) r2 ON r1.aprendiz_id = r2.aprendiz_id AND r1.test_id = r2.test_id AND r1.fecha_presentacion = r2.ultima_fecha
        `;
        const [rows] = await db.execute(query, [...aprendizIds, ...testIds, ...aprendizIds, ...testIds]);
        return rows;
    },

    // 🚀 NUEVO: resultado de diagnóstico por aprendiz para una competencia
    async obtenerResultadosDiagnostico(aprendizIds, competenciaId) {
        if (!aprendizIds.length) return [];
        const placeholders = aprendizIds.map(() => '?').join(',');
        const query = `
            SELECT r.aprendiz_id, r.puntaje, r.nivel_sugerido, r.fecha_presentacion
            FROM resultados_diagnosticos r
            INNER JOIN tests_diagnosticos td ON r.test_diagnostico_id = td.id
            WHERE r.aprendiz_id IN (${placeholders}) AND td.competencia_id = ?
            ORDER BY r.fecha_presentacion DESC
        `;
        const [rows] = await db.execute(query, [...aprendizIds, competenciaId]);
        return rows;
    },
    
    async obtenerResultadosTestsIAConAnalisis(aprendizIds, testIds) {
    if (!aprendizIds.length || !testIds.length) return [];
    const placeholdersAp = aprendizIds.map(() => '?').join(',');
    const placeholdersTe = testIds.map(() => '?').join(',');
    const query = `
        SELECT r1.aprendiz_id, r1.test_id, r1.puntaje, r1.aprobado, r1.analisis_ia, r1.fecha_presentacion
        FROM resultados_tests_ia r1
        INNER JOIN (
            SELECT aprendiz_id, test_id, MAX(fecha_presentacion) AS ultima_fecha
            FROM resultados_tests_ia
            WHERE aprendiz_id IN (${placeholdersAp}) AND test_id IN (${placeholdersTe})
            GROUP BY aprendiz_id, test_id
        ) r2 ON r1.aprendiz_id = r2.aprendiz_id AND r1.test_id = r2.test_id AND r1.fecha_presentacion = r2.ultima_fecha
    `;
    const [rows] = await db.execute(query, [...aprendizIds, ...testIds, ...aprendizIds, ...testIds]);
    return rows;
},

// 🤖 NUEVO: diagnóstico con analisis_ia completo (para el análisis grupal con IA)
async obtenerResultadosDiagnosticoConAnalisis(aprendizIds, competenciaId) {
    if (!aprendizIds.length) return [];
    const placeholders = aprendizIds.map(() => '?').join(',');
    const query = `
        SELECT r.aprendiz_id, r.puntaje, r.nivel_sugerido, r.analisis_ia, r.fecha_presentacion
        FROM resultados_diagnosticos r
        INNER JOIN tests_diagnosticos td ON r.test_diagnostico_id = td.id
        WHERE r.aprendiz_id IN (${placeholders}) AND td.competencia_id = ?
        ORDER BY r.fecha_presentacion DESC
    `;
    const [rows] = await db.execute(query, [...aprendizIds, competenciaId]);
    return rows;
}
};