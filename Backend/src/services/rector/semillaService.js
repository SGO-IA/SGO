import { semillaRectorModel } from '../../models/rector/semillasModels.js';

export const semillaRectorService = {
    async getSemillasParaRevision() {
        const semillas = await semillaRectorModel.obtenerSemillasPendientes();
        
        // Formateo de datos para enviarle una estructura más limpia a Angular
        return semillas.map(semilla => ({
            ...semilla,
            etiqueta_programa: `${semilla.programa_codigo} - V${semilla.programa_version}`
        }));
    },

    async getDetalleRevision(semillaId) {
        // Ejecutamos las 3 consultas al mismo tiempo para máxima velocidad
        const [detalleBase, expertos, ovas] = await Promise.all([
            semillaRectorModel.getDetalleBasico(semillaId),
            semillaRectorModel.getExpertosAsignados(semillaId),
            semillaRectorModel.getOvasDetalle(semillaId)
        ]);

        if (!detalleBase) {
            throw new Error(`No se encontró la semilla con ID ${semillaId}`);
        }

        // Ensamblamos la radiografía completa
        return {
            ...detalleBase,
            etiqueta_programa: `${detalleBase.programa_codigo} - V${detalleBase.programa_version}`,
            total_expertos: expertos.length,
            expertos: expertos,
            total_ovas: ovas.length,
            ovas: ovas
        };
    },

    async listarOvasDeSemilla(semillaId) {
        const ovas = await semillaRectorModel.getOvasPorSemilla(semillaId);
        if (!ovas.length) throw new Error("No se encontraron OVAs para esta semilla.");
        return ovas;
    },

    async listarCiclosDeOva(ovaId) {
        const ciclos = await semillaRectorModel.getCiclosPorOva(ovaId);
        if (!ciclos.length) throw new Error("No se encontraron ciclos didácticos para este OVA.");
        return ciclos;
    },

    async armarModoLecturaCiclo(cicloId) {
        const [cabecera, seccionesRaw, enlacesRaw, recursosRaw] = await Promise.all([
            semillaRectorModel.getCabeceraCicloLectura(cicloId),
            semillaRectorModel.getSeccionesCicloLectura(cicloId),
            semillaRectorModel.getEnlacesCiclo(cicloId),
            semillaRectorModel.getRecursosR2Ciclo(cicloId)
        ]);

        if (!cabecera) throw new Error("El ciclo didáctico no existe.");

        // Mapeamos las secciones y les inyectamos sus enlaces y recursos
        const seccionesFormateadas = seccionesRaw.map(seccion => {
            // 1. Parseo del Test IA
            let testParseado = null;
            if (seccion.preguntas_json) {
                try {
                    testParseado = typeof seccion.preguntas_json === 'string' 
                        ? JSON.parse(seccion.preguntas_json) 
                        : seccion.preguntas_json;
                } catch (e) {
                    console.error("Error parseando preguntas_json:", seccion.seccion_id);
                }
            }

            // 2. Filtramos los enlaces que pertenecen SOLO a esta sección
            const enlacesSeccion = enlacesRaw.filter(e => e.seccion_id === seccion.seccion_id);
            
            // 3. Filtramos los recursos R2 que pertenecen SOLO a esta sección
            const recursosSeccion = recursosRaw.filter(r => r.seccion_id === seccion.seccion_id);

            return {
                seccion_id: seccion.seccion_id,
                tipo_seccion: seccion.tipo_seccion,
                titulo: seccion.seccion_titulo,
                contenido_html: seccion.contenido_html,
                test: testParseado ? {
                    nombre: seccion.nombre_test,
                    ponderacion: seccion.ponderacion,
                    preguntas: testParseado
                } : null,
                enlaces: enlacesSeccion,
                recursos: recursosSeccion
            };
        });

        return {
            ...cabecera,
            secciones: seccionesFormateadas
        };
    },

    async procesarCambioEstado(id, estado, comentario) {
        // 1. Validar contra el ENUM estricto de tu base de datos
        const estadosValidos = ['aprobada', 'rechazada'];
        if (!estadosValidos.includes(estado)) {
            throw new Error('Estado no permitido por el sistema.');
        }

        // 2. Lógica de limpieza: Si es aprobada, no debe haber comentario de rechazo
        const comentarioFinal = estado === 'rechazada' ? comentario : null;

        // 3. Ejecutar actualización
        const actualizado = await semillaRectorModel.actualizarEstado(id, estado, comentarioFinal);
        
        if (!actualizado) {
            throw new Error('La semilla no existe o no pudo ser actualizada.');
        }
        
        return { estadoNuevo: estado, comentario: comentarioFinal };
    }
};