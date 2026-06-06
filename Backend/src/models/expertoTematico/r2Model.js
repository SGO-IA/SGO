import db  from '../../config/dbConfig.js'; // Tu conexión configurada de MySQL2 / Pool

export class MaterialModel {
    static async createRecurso({ seccionId, nombreArchivo, urlR2, tipoArchivo }) {
        // Sentencia SQL alineada con los campos exactos de tu tabla recursos_r2
        const query = `
            INSERT INTO recursos_r2 (seccion_id, nombre_archivo, url_r2, tipo_archivo)
            VALUES (?, ?, ?, ?)
        `;
        
        // Ejecución parametrizada segura contra Inyección SQL
        const [result] = await db.execute(query, [seccionId, nombreArchivo, urlR2, tipoArchivo]);
        
        // Retornamos el id autoincrementable generado por MySQL
        return result.insertId;
    }
}