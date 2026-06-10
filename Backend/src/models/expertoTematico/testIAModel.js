// Protocolo SGO-Layered: Model
import db from '../../config/dbConfig.js';

export const TestIAModel = {
    // Busca si ya hay un test asociado a esta sección
    obtenerTestPorSeccion: async (seccionId) => {
        const query = `SELECT id FROM tests_ia WHERE seccion_id = ? LIMIT 1`;
        const [rows] = await db.execute(query, [seccionId]);
        return rows.length > 0 ? rows[0] : null;
    },

    guardarTest: async (seccionId, nombreTest, ponderacion, preguntasJson) => {
        const idSeccion = parseInt(seccionId, 10);
        // Validamos si ya existe
        const testExistente = await TestIAModel.obtenerTestPorSeccion(idSeccion);

        if (testExistente) {
            // Actualizar el existente
            const query = `
                UPDATE tests_ia 
                SET nombre_test = ?, ponderacion = ?, preguntas_json = ? 
                WHERE id = ?
            `;
            await db.execute(query, [
                nombreTest || 'Evaluación de Conocimiento',
                ponderacion || 100.00,
                JSON.stringify(preguntasJson),
                testExistente.id
            ]);
            return { id: testExistente.id, accion: 'actualizado' };
        } else {
            // Crear uno nuevo
            const query = `
                INSERT INTO tests_ia (seccion_id, nombre_test, ponderacion, preguntas_json)
                VALUES (?, ?, ?, ?)
            `;
            const [result] = await db.execute(query, [
                idSeccion,
                nombreTest || 'Evaluación de Conocimiento',
                ponderacion || 100.00,
                JSON.stringify(preguntasJson)
            ]);
            return { id: result.insertId, accion: 'creado' };
        }
    }
};