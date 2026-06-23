import db from '../../config/dbConfig.js';

export const coordinadorSelectoresModel = {
    // 1. Fichas de un programa específico que NO tengan semilla asignada
    async getFichasDisponibles(programaId) {
        const query = `
            SELECT id, codigo_ficha, ficha_caracterizacion 
            FROM fichas 
            WHERE programa_id = ? AND semilla_id IS NULL;
        `;
        const [rows] = await db.execute(query, [programaId]);
        return rows;
    },

    // 2. Todos los instructores activos (Asumiendo que rol_id = 3 es Instructor, cámbialo si tu rol es otro)
    async getInstructoresActivos() {
        const query = `
            SELECT id, nombre, correo 
            FROM usuarios 
            WHERE rol_id = 2 AND activo = 1
            ORDER BY nombre ASC;
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    // 3. Las competencias asociadas a un programa
    async getCompetenciasPorPrograma(programaId) {
        const query = `
            SELECT id, codigo_norma, nombre 
            FROM competencias 
            WHERE programa_id = ?;
        `;
        const [rows] = await db.execute(query, [programaId]);
        return rows;
    },

    async obtenerFichasYAprendices() {
        const query = `
            SELECT 
                f.id AS ficha_id,
                f.codigo_ficha,
                p.nombre AS programa_nombre,
                u.id AS aprendiz_id,
                u.nombre AS aprendiz_nombre,
                u.correo AS aprendiz_correo,
                u.activo AS aprendiz_activo
            FROM fichas f
            LEFT JOIN programas p ON f.programa_id = p.programa_id
            LEFT JOIN matriculas_aprendices ma ON f.id = ma.ficha_id 
            LEFT JOIN usuarios u ON ma.aprendiz_id = u.id AND u.rol_id = 1
            ORDER BY f.id DESC;
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    async insertarFicha(conn, datos) {
        const query = `
            INSERT INTO fichas (
                codigo_ficha, ficha_caracterizacion, programa_id, 
                centro_id, fecha_inicio, fecha_fin, modalidad
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await conn.execute(query, [
            datos.codigo_ficha,
            datos.ficha_caracterizacion,
            datos.programa_id,
            datos.centro_id,
            datos.fecha_inicio,
            datos.fecha_fin,
            datos.modalidad
        ]);
        return result.insertId;
    },

    async buscarUsuarioPorCorreo(conn, correo) {
        const [rows] = await conn.execute('SELECT id, nombre FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
        return rows[0];
    },

    async crearAprendiz(conn, correo, contrasenaHash) {
        const nombre = correo.split('@')[0]; // Nombre por defecto basado en el correo
        // Rol 1 = Aprendiz
        const query = `INSERT INTO usuarios (rol_id, nombre, correo, contrasena, activo) VALUES (1, ?, ?, ?, 1)`;
        const [result] = await conn.execute(query, [nombre, correo, contrasenaHash]);
        return { id: result.insertId, nombre };
    },

    async matricularAprendiz(conn, aprendizId, fichaId) {
        // Usamos INSERT IGNORE por si ya estaba matriculado (evita romper la transacción por la llave única)
        const query = `INSERT IGNORE INTO matriculas_aprendices (aprendiz_id, ficha_id) VALUES (?, ?)`;
        await conn.execute(query, [aprendizId, fichaId]);
    },

    async listarProgramas() {
        const [rows] = await db.execute('SELECT programa_id, nombre FROM programas');
        return rows;
    },
    async listarCentros() {
        const [rows] = await db.execute('SELECT id, nombre_centro FROM centros_formacion');
        return rows;
    }
};