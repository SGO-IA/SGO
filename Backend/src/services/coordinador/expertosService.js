import { expertoModel } from '../../models/coordinador/expertosModels.js';

export const expertoService = {
    async getExpertosTematicos() {
        const filas = await expertoModel.obtenerExpertos();
        
        // Mapa para agrupar las semillas por cada experto único
        const mapaExpertos = new Map();

        filas.forEach(fila => {
            if (!mapaExpertos.has(fila.experto_id)) {
                mapaExpertos.set(fila.experto_id, {
                    id: fila.experto_id,
                    nombre: fila.nombre_experto,
                    correo: fila.correo_experto,
                    rol: fila.rol,
                    semillas_vinculadas: []
                });
            }

            // Si el experto tiene una semilla asociada en la tabla intermedia, la metemos a su lista
            if (fila.semilla_id) {
                mapaExpertos.get(fila.experto_id).semillas_vinculadas.push({
                    id: fila.semilla_id,
                    nombre_semilla: fila.nombre_semilla,
                    estado_semilla: fila.estado_semilla,
                    programa: fila.nombre_programa,
                    codigo_programa: fila.codigo_programa,
                    fecha_asignacion: fila.fecha_asignacion
                });
            }
        });

        // Retorna el array limpio estructurado para tu Angular
        return Array.from(mapaExpertos.values());
    }
};