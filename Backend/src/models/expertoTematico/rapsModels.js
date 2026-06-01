// Protocolo SGO-Layered: Model
import db from '../../config/dbConfig.js';

export const RapsModel = {
  obtenerRapsAsignados: async (expertoId, semillaId) => {
    // Se añade un JOIN a competencias para homogeneizar la estructura esperada por el árbol de Angular
    const query = `
      SELECT 
        r.id, 
        r.codigo_rap, 
        r.denominacion, 
        r.competencia_id,
        c.nombre AS competencia_nombre
      FROM expertos_raps_trabajo ert
      INNER JOIN resultados_aprendizaje r ON ert.rap_id = r.id
      INNER JOIN competencias c ON r.competencia_id = c.id
      WHERE ert.experto_id = ? AND ert.semilla_id = ?
      ORDER BY r.codigo_rap ASC;
    `;
    const [rows] = await db.execute(query, [expertoId, semillaId]);
    return rows;
  },

  obtenerRapsDisponiblesPorSemilla: async (semillaId) => {
    // Dejamos r.id y r.denominacion puros para que Angular los lea de forma estandarizada en la vista
    const query = `
      SELECT 
        r.id, 
        r.codigo_rap, 
        r.denominacion, 
        c.id AS competencia_id,
        c.nombre AS competencia_nombre,
        u.id AS asignado_experto_id,
        u.nombre AS asignado_experto_nombre
      FROM semillas s
      INNER JOIN competencias c ON s.programa_id = c.programa_id
      INNER JOIN resultados_aprendizaje r ON c.id = r.competencia_id
      LEFT JOIN expertos_raps_trabajo ert ON r.id = ert.rap_id AND ert.semilla_id = s.id
      LEFT JOIN usuarios u ON ert.experto_id = u.id
      WHERE s.id = ?
      ORDER BY c.id, r.codigo_rap ASC;
    `;
    const [rows] = await db.execute(query, [semillaId]);
    return rows;
  },

  guardarSeleccionMasiva: async (expertoId, semillaId, rapIds) => {
    // Conversión decimal explícita (Base 10) para resguardar la integridad de tipos en sgoDB (INT)
    const idExperto = parseInt(expertoId, 10);
    const idSemilla = parseInt(semillaId, 10);

    const valuesStatement = rapIds.map(() => '(?, ?, ?)').join(', ');
    const query = `
      INSERT IGNORE INTO expertos_raps_trabajo (experto_id, semilla_id, rap_id)
      VALUES ${valuesStatement}
    `;

    const params = [];
    rapIds.forEach(rapId => {
      params.push(idExperto, idSemilla, parseInt(rapId, 10));
    });

    const [result] = await db.execute(query, params);
    return result;
  }
};