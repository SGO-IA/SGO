import { semillaModel } from '../../models/coordinador/semillasModels.js';
import db from '../../config/dbConfig.js';

export const semillaService = {
    async crearNuevaSemillaConExpertos({ programa_id, nombre_semilla, expertos }) {
        // Obtenemos una conexión exclusiva del pool para controlar la transacción manualmente
        const connection = await db.getConnection();
        
        try {
            // 1. Iniciamos la transacción atómica
            await connection.beginTransaction();

            // 2. Insertamos la cabecera de la semilla
            const semillaId = await semillaModel.insertarSemilla(connection, { programa_id, nombre_semilla });

            // 3. Mapeamos e insertamos de forma masiva cada experto con su respectiva competencia
            // expertos es un objeto: { "ID_EXPERTO": [ID_COMPETENCIA_1, ID_COMPETENCIA_2] }
            for (const [expertoIdStr, competenciasIds] of Object.entries(expertos)) {
                const expertoId = parseInt(expertoIdStr, 10);

                for (const competenciaId of competenciasIds) {
                    await semillaModel.vincularExpertoACompetencia(connection, {
                        experto_id: expertoId,
                        semilla_id: semillaId,
                        competencia_id: competenciaId
                    });
                }
            }

            // 4. Si todo salió impecable, consolidamos los cambios en el storage SQL
            await connection.commit();
            return { semillaId };

        } catch (error) {
            // 5. Si algo falla (ej: violación de llave foránea o caída de red), revertimos todo para no dejar basura
            await connection.rollback();
            throw error;
        } finally {
            // Devolvemos la conexión al pool de inmediato
            connection.release();
        }
    },

    async listarSemillasPedagogicas() {
        // Orquestamos la consulta al modelo mapeador
        const semillas = await semillaModel.obtenerListaSemillas();
        
        // Aquí podrías aplicar formateos de fecha o mutaciones de negocio si se requiriera en el futuro
        return semillas;
    }
};