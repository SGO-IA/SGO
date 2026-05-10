import db from '../../config/dbConfig.js';

export const iaModel = {
    getProgramasWithCompetencias: async () => {
        const query = `
            SELECT 
                p.programa_id, p.nombre as programa_nombre, p.codigo as programa_codigo,
                COALESCE(
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', c.id,
                            'nombre', c.nombre,
                            'codigo_norma', c.codigo_norma
                        )
                    ) FROM competencias c WHERE c.programa_id = p.programa_id),
                    JSON_ARRAY()
                ) as competencias
            FROM programas p;
        `;
        const [rows] = await db.execute(query);
        
        // IMPORTANTE: Si rows.competencias llega como string, hay que parsearlo
        return rows.map(row => ({
            ...row,
            competencias: typeof row.competencias === 'string' 
                ? JSON.parse(row.competencias) 
                : (row.competencias || [])
        }));
    },

    getEstructuraPedagogica: async (competenciaId) => {
        const query = `
            SELECT 
                r.id as rap_id, r.codigo_rap, r.denominacion as rap_nombre,
                COALESCE((SELECT JSON_ARRAYAGG(descripcion) FROM conocimientos_saber WHERE rap_id = r.id), JSON_ARRAY()) as saberes,
                COALESCE((SELECT JSON_ARRAYAGG(descripcion) FROM conocimientos_proceso WHERE rap_id = r.id), JSON_ARRAY()) as procesos,
                COALESCE((SELECT JSON_ARRAYAGG(descripcion) FROM criterios_evaluacion WHERE rap_id = r.id), JSON_ARRAY()) as criterios
            FROM resultados_aprendizaje r
            WHERE r.competencia_id = ?;
        `;
        const [rows] = await db.execute(query, [competenciaId]);
        
        return rows.map(row => ({
            ...row,
            saberes: typeof row.saberes === 'string' ? JSON.parse(row.saberes) : row.saberes,
            procesos: typeof row.procesos === 'string' ? JSON.parse(row.procesos) : row.procesos,
            criterios: typeof row.criterios === 'string' ? JSON.parse(row.criterios) : row.criterios
        }));
    },

    obtenerTestPorCompetencia: async (competenciaId) => {
        const consulta = `
            SELECT 
                t.id AS test_id,
                t.nombre_test,
                t.preguntas_json,
                t.ponderacion,
                s.tipo_seccion,
                c.titulo AS ciclo_nombre
            FROM competencias comp
            INNER JOIN ovas o ON o.competencia_id = comp.id
            INNER JOIN ciclos_didacticos c ON c.ova_id = o.id
            INNER JOIN ciclo_secciones s ON s.ciclo_id = c.id
            INNER JOIN tests_ia t ON t.seccion_id = s.id
            WHERE comp.id = ?
            LIMIT 1;
        `;
        const [filas] = await db.execute(consulta, [competenciaId]);
        return filas[0] || null;
    }
};