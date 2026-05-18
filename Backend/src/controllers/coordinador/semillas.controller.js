import { semillaService } from '../../services/coordinador/semillasService.js';

export const semillaController = {
    async crearSemillaCompleta(req, res) {
        try {
            const { programa_id, nombre_semilla, expertos } = req.body;

            // Validación rápida de parámetros obligatorios
            if (!programa_id || !nombre_semilla || !expertos || Object.keys(expertos).length === 0) {
                return res.status(400).json({ 
                    message: "Faltan datos obligatorios para crear la semilla y sus asignaciones." 
                });
            }

            // Orquestamos la creación mediante el servicio
            const resultado = await semillaService.crearNuevaSemillaConExpertos({
                programa_id,
                nombre_semilla,
                expertos
            });

            return res.status(201).json({
                message: "Semilla pedagógica creada y expertos vinculados con éxito.",
                semillaId: resultado.semillaId
            });

        } catch (error) {
            return res.status(500).json({
                message: "Error en el servidor al registrar la semilla pedagógica",
                error: error.message
            });
        }
    },

    async obtenerTodasLasSemillas(req, res) {
        try {
            // Solicitamos la lista de semillas ya formateada al servicio
            const semillas = await semillaService.listarSemillasPedagogicas();

            return res.status(200).json(semillas);
        } catch (error) {
            console.error("Error en obtenerTodasLasSemillas:", error);
            return res.status(500).json({
                message: "Error en el servidor al recuperar el listado de semillas.",
                error: error.message
            });
        }
    }
};