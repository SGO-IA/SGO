import { cicloModel } from '../../models/expertoTematico/cicloDidacticoModel.js';

const ETAPAS_REQUERIDAS = ['Reflexion', 'Contextualizacion', 'Apropiacion', 'Transferencia'];
const ETAPAS_CON_TEST   = ['Apropiacion', 'Transferencia'];

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
    },

    async verificarEstadoCiclo(cicloId) {
        const secciones = await cicloModel.getEstadoSecciones(cicloId);

        if (!secciones.length) {
            throw new Error(`No se encontraron secciones para el ciclo ${cicloId}`);
        }

        // 1. ¿Existen las 4 etapas Y tienen contenido real?
        const tiposPresentes = secciones
            .filter(s => s.tiene_contenido === 1)
            .map(s => s.tipo_seccion);
            
        const tieneTodasLasEtapas = ETAPAS_REQUERIDAS.every(e => tiposPresentes.includes(e));

        // 2. Detalle estricto por sección
        const seccionesDetalle = secciones.map(s => {
            const necesitaTest   = ETAPAS_CON_TEST.includes(s.tipo_seccion);
            const tieneTest      = s.tiene_test > 0;
            const tieneContenido = s.tiene_contenido === 1;
            
            // Una sección solo está completa si tiene texto Y (si no necesita test, o si lo necesita y lo tiene)
            const completa = tieneContenido && (!necesitaTest || tieneTest);

            return {
                seccion_id:      s.seccion_id,
                tipo_seccion:    s.tipo_seccion,
                titulo:          s.titulo,
                tiene_contenido: tieneContenido,
                necesita_test:   necesitaTest,
                tiene_test:      tieneTest,
                completa
            };
        });

        const cicloListo = tieneTodasLasEtapas && seccionesDetalle.every(s => s.completa);

        return {
            cicloId,
            listo_para_finalizar:   cicloListo,
            tiene_todas_las_etapas: tieneTodasLasEtapas,
            secciones:              seccionesDetalle
        };
    },

async finalizarCiclo(cicloId) {
        // 1. Verificación rigurosa (tu lógica existente)
        const estado = await cicloService.verificarEstadoCiclo(cicloId);

        if (!estado.listo_para_finalizar) {
            const sinContenido = estado.secciones
                .filter(s => !s.tiene_contenido)
                .map(s => s.tipo_seccion);

            const sinTest = estado.secciones
                .filter(s => s.tiene_contenido && s.necesita_test && !s.tiene_test)
                .map(s => s.tipo_seccion);

            let msg = '';
            
            if (!estado.tiene_todas_las_etapas) {
                msg += 'El ciclo no tiene las 4 etapas requeridas. ';
            }
            if (sinContenido.length > 0) {
                msg += `Falta redactar contenido en: ${sinContenido.join(', ')}. `;
            }
            if (sinTest.length > 0) {
                msg += `Falta generar el test IA en: ${sinTest.join(', ')}.`;
            }

            throw new Error(msg.trim());
        }

        // 2. Ejecutar finalización del ciclo
        const result = await cicloModel.finalizarCiclo(cicloId);

        if (result.affectedRows === 0) {
            throw new Error(`No se encontró el ciclo ${cicloId} para finalizar.`);
        }

        // ---------------------------------------------------------
        // 3. ORQUESTACIÓN DEL EFECTO DOMINÓ (CASCADA)
        // ---------------------------------------------------------
        
        // A. Validar el Padre (OVA)
        const ovaId = await cicloModel.obtenerOvaIdPorCiclo(cicloId);
        
        if (ovaId) {
            const ciclosPendientes = await cicloModel.contarCiclosPendientesPorOva(ovaId);
            
            if (ciclosPendientes === 0) {
                // Todos los ciclos terminaron -> Finalizamos el OVA
                await cicloModel.marcarOvaFinalizado(ovaId);
                console.log(`✅ [Service] OVA ${ovaId} finalizado completamente.`);

                // B. Validar el Abuelo (Semilla)
                const semillaId = await cicloModel.obtenerSemillaIdPorOva(ovaId);
                
                if (semillaId) {
                    const ovasPendientes = await cicloModel.contarOvasPendientesPorSemilla(semillaId);
                    
                    if (ovasPendientes === 0) {
                        // Todos los OVAs terminaron -> La semilla pasa a revisión
                        await cicloModel.marcarSemillaPendienteRector(semillaId);
                        console.log(`🚀 [Service] Semilla ${semillaId} lista para revisión del coordinador.`);
                        
                        // OPCIONAL: Aquí podrías emitir un evento, enviar un email con Resend o Brevo, 
                        // o guardar una notificación en la base de datos para el coordinador.
                    }
                }
            }
        }

        return { cicloId, finalizado: true };
    }
};