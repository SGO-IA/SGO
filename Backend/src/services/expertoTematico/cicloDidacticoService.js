import { cicloModel } from '../../models/expertoTematico/cicloDidacticoModel.js';

export const cicloService = {
    async getDashboardExperto(expertoId) {
        return await cicloModel.obtenerDashboardPorExperto(expertoId);
    },

    async getFasesProyecto() {
        return await cicloModel.obtenerFases();
    },

    async registrarNuevoCiclo(data) {
        // Aquí podrías agregar validaciones extra antes de persistir
        if (!data.ova_id || !data.fase_proyecto_id) {
            throw new Error("Faltan datos obligatorios para el ciclo");
        }
        return await cicloModel.crearCiclo(data);
    },

    async validarExistencia(ova_id) {
        return await cicloModel.verificarCicloExistente(ova_id);
    },

    async obtenerCiclosPorOva(ovaId) {
        return await cicloModel.obtenerCiclosConExpertoPorOva(ovaId);
    },

async procesarGuardadoEtapa(cicloId, payload) {
        // 1. Mapeo al ENUM de la BD
        const mapaEtapas = {
            'Reflexión Inicial': 'Reflexion',
            'Contextualización': 'Contextualizacion',
            'Apropiación': 'Apropiacion',
            'Transferencia': 'Transferencia'
        };
        const tipoSeccionEnum = mapaEtapas[payload.tipo_etapa] || 'Reflexion';

        // 2. Adjuntar links al HTML
        let contenidoFinal = payload.contenido_html || '';
        if (payload.enlaces_externos && payload.enlaces_externos.length > 0) {
            const linksHtml = payload.enlaces_externos
                .map(link => `<li><a href="${link}" target="_blank" rel="noopener noreferrer" class="text-sena hover:underline">${link}</a></li>`)
                .join('');
            contenidoFinal += `\n<div class="enlaces-externos mt-4"><h4>Recursos de Apoyo:</h4><ul class="list-disc pl-5">${linksHtml}</ul></div>`;
        }

        // 3. Upsert de la Sección (Buscar -> Actualizar o Insertar)
        let seccion = await cicloModel.obtenerSeccionPorCicloYTipo(cicloId, tipoSeccionEnum);
        let seccionId;

        if (seccion) {
            await cicloModel.actualizarSeccion(seccion.id, contenidoFinal);
            seccionId = seccion.id;
        } else {
            const insertResult = await cicloModel.crearSeccion(cicloId, tipoSeccionEnum, contenidoFinal);
            seccionId = insertResult.id;
        }

        // 4. Persistencia de Recursos R2 (Ahora sí tenemos el seccionId seguro)
        if (payload.recursos_adjuntos && payload.recursos_adjuntos.length > 0) {
            for (const recurso of payload.recursos_adjuntos) {
                // Insertamos en BD usando el seccionId real
                await cicloModel.guardarRecursoR2(seccionId, recurso.nombre, recurso.url, recurso.tipoArchivo);
            }
        }

        return { seccionId, cicloId, tipo_seccion: tipoSeccionEnum };
    }
};