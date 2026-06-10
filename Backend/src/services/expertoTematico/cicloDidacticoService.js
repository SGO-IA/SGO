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

async obtenerEtapaCompleta(cicloId, tipoEtapaFrontend) {
        // 1. Mapeo inverso / directo del ENUM
        const mapaEtapas = {
            'Reflexión Inicial': 'Reflexion',
            'Contextualización': 'Contextualizacion',
            'Apropiación': 'Apropiacion',
            'Transferencia': 'Transferencia'
        };
        const tipoSeccionEnum = mapaEtapas[tipoEtapaFrontend] || tipoEtapaFrontend;

        // 2. Buscar la sección base
        const seccion = await cicloModel.obtenerSeccionPorCicloYTipo(cicloId, tipoSeccionEnum);

        // Si no hay sección guardada, devolvemos un cascarón vacío para el Frontend
        if (!seccion) {
            return {
                titulo: '',
                contenido_html: '',
                enlaces_externos: [],
                recursos_adjuntos: [],
                test_generado: null // ✅ Cascarón nulo para el test
            };
        }

        // 3. Buscar data relacional en paralelo (Optimización de tiempo)
        // ✅ Agregamos obtenerTestPorSeccion al array de promesas
        const [enlaces, recursos, testIA] = await Promise.all([
            cicloModel.obtenerEnlacesPorSeccion(seccion.id),
            cicloModel.obtenerRecursosPorSeccion(seccion.id),
            cicloModel.obtenerTestPorSeccion(seccion.id) 
        ]);

        // 4. Construir y retornar el DTO consolidado
        return {
            seccionId: seccion.id,
            titulo: seccion.titulo || '',
            contenido_html: seccion.contenido_html || '',
            enlaces_externos: enlaces.map(link => ({ id: link.id, url: link.url })), 
            recursos_adjuntos: recursos.map(rec => ({
                id: rec.id, 
                nombre: rec.nombre_archivo,
                url: rec.url_r2,
                tipoArchivo: rec.tipo_archivo,
                keyR2: rec.key_r2
            })),
            // ✅ Mapeamos el test exactamente con la estructura que Angular espera
            test_generado: testIA ? {
                id: testIA.id,
                nombre_test: testIA.nombre_test,
                ponderacion: testIA.ponderacion,
                // Nota: mysql2 a veces devuelve el JSON ya parseado, por seguridad validamos
                preguntas: typeof testIA.preguntas_json === 'string' 
                            ? JSON.parse(testIA.preguntas_json) 
                            : testIA.preguntas_json
            } : null
        };
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

        // 2. Extraer HTML puro (SIN INYECTAR LINKS AQUÍ)
        const contenidoFinal = payload.contenido_html || '';
        const titulo = payload.titulo || 'Sin título';

        // 3. Upsert de la Sección (Buscar -> Actualizar o Insertar)
        let seccion = await cicloModel.obtenerSeccionPorCicloYTipo(cicloId, tipoSeccionEnum);
        let seccionId;

        if (seccion) {
            console.log('DEBUG SERVICE:', seccion.id);
            await cicloModel.actualizarSeccion(seccion.id, contenidoFinal, titulo);
            seccionId = seccion.id;
        } else {
            const insertResult = await cicloModel.crearSeccion(cicloId, tipoSeccionEnum, contenidoFinal, titulo);
            seccionId = insertResult.id;
        }

        // 4. Persistencia de Recursos R2
        await cicloModel.borrarRecursosPorSeccion(seccionId);
        if (payload.recursos_adjuntos && payload.recursos_adjuntos.length > 0) {
            for (const recurso of payload.recursos_adjuntos) {
                // Ahora sí, insertamos la lista limpia
                await cicloModel.guardarRecursoR2(
                    seccionId, 
                    recurso.nombre, 
                    recurso.url, 
                    recurso.tipoArchivo || null, 
                    recurso.key || null
                );
            }
        }

        // 5. Persistencia de Enlaces Externos (Sincronización destructiva)
        // Borramos los anteriores y reinsertamos los nuevos enviados por el frontend
        await cicloModel.borrarEnlacesPorSeccion(seccionId);
        
        if (payload.enlaces_externos && payload.enlaces_externos.length > 0) {
            for (const linkUrl of payload.enlaces_externos) {
                await cicloModel.insertarEnlace(seccionId, linkUrl);
            }
        }

        return { seccionId, cicloId, tipo_seccion: tipoSeccionEnum };
    },

    async eliminarEnlace(enlaceId) {
        return await cicloModel.eliminarEnlace(enlaceId);
    }
};