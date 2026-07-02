import db from '../../config/dbConfig.js';

export const aprendizModel = {
    async obtenerFichasPorAprendiz(aprendizId) {
        const query = `
            SELECT 
                f.id AS ficha_id,
                f.codigo_ficha,
                f.estado AS estado_ficha,
                f.fecha_inicio,
                f.fecha_fin,
                f.modalidad,
                p.nombre AS nombre_programa,
                p.nivel_formacion
            FROM matriculas_aprendices ma
            INNER JOIN fichas f ON ma.ficha_id = f.id
            INNER JOIN programas p ON f.programa_id = p.programa_id
            WHERE ma.aprendiz_id = ?
            ORDER BY f.estado ASC, f.fecha_inicio DESC;
        `;
        // El ordenamiento prioriza las activas ('lectiva'/'productiva' suelen ir antes alfabéticamente o según tu enum)
        
        const [rows] = await db.execute(query, [aprendizId]);
        return rows;
    },

    async verificarMatricula(aprendizId, fichaId) {
        const query = `SELECT id FROM matriculas_aprendices WHERE aprendiz_id = ? AND ficha_id = ?`;
        const [rows] = await db.execute(query, [aprendizId, fichaId]);
        return rows.length > 0;
    },

    // Obtenemos los datos base de la semilla vinculada a la ficha
    async getSemillaFicha(fichaId) {
        // Aseguramos los nombres de los campos explícitamente
        const query = `
            SELECT s.id, s.nombre_semilla, p.nombre AS programa_nombre 
            FROM fichas f 
            INNER JOIN semillas s ON f.semilla_id = s.id 
            INNER JOIN programas p ON f.programa_id = p.programa_id 
            WHERE f.id = ?
        `;
        const [rows] = await db.execute(query, [fichaId]);
        return rows[0];
    },

    // Obtenemos las OVAS activas de la semilla
    async getOvas(semillaId) {
        const query = `SELECT id, titulo, descripcion FROM ovas WHERE semilla_id = ? AND activo = 1`;
        const [rows] = await db.execute(query, [semillaId]);
        return rows;
    },

    // Obtenemos los ciclos de una OVA ordenados
    async getCiclos(ovaId) {
        const query = `SELECT id, titulo, descripcion_general, orden FROM ciclos_didacticos WHERE ova_id = ? ORDER BY orden ASC`;
        const [rows] = await db.execute(query, [ovaId]);
        return rows;
    },

    // Obtenemos las secciones, cruzando con recursos R2 y Tests mediante LEFT JOIN
    async getSeccionesYRecursos(cicloId) {
        const query = `
            SELECT 
                cs.id AS seccion_id, cs.tipo_seccion, cs.titulo, cs.contenido_html, cs.orden,
                r.id AS recurso_id, r.nombre_archivo, r.url_r2, r.tipo_archivo, 
                COALESCE(r.key_r2, r.keyR2) AS key_r2,
                t.id AS test_id, t.nombre_test, t.preguntas_json,
                e.id AS enlace_id, e.url AS enlace_url, e.etiqueta AS enlace_etiqueta
            FROM ciclo_secciones cs
            LEFT JOIN recursos_r2 r ON cs.id = r.seccion_id
            LEFT JOIN tests_ia t ON cs.id = t.seccion_id
            LEFT JOIN enlaces_seccion e ON cs.id = e.seccion_id
            WHERE cs.ciclo_id = ?
            ORDER BY cs.orden ASC
        `;
        const [rows] = await db.execute(query, [cicloId]);
        return rows;
    },

    async obtenerRecursoPorId(recursoId) {
        const query = `
            SELECT id, seccion_id, nombre_archivo, COALESCE(key_r2, keyR2) AS key_r2, tipo_archivo
            FROM recursos_r2 
            WHERE id = ?
        `;
        const [rows] = await db.execute(query, [recursoId]);
        return rows[0];
    },

    async obtenerProgresoCiclosPorOva(aprendizId, ovaId) {
        const query = `
            SELECT pc.ciclo_id, pc.completado, pc.fecha_completado
            FROM progreso_ciclos pc
            INNER JOIN ciclos_didacticos cd ON pc.ciclo_id = cd.id
            WHERE pc.aprendiz_id = ? AND cd.ova_id = ? AND pc.completado = 1
        `;
        const [rows] = await db.execute(query, [aprendizId, ovaId]);
        return rows;
    }
};