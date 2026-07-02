import { aprendizModel } from '../../models/aprendiz/aprendizModels.js';
import { MaterialService } from '../../services/expertoTematico/r2Services.js';

export const aprendizService = {
    async listarMisFichas(aprendizId) {
        // Por ahora es un puente directo a la base de datos
        const misFichas = await aprendizModel.obtenerFichasPorAprendiz(aprendizId);
        return misFichas;
    },

    async obtenerEntornoFicha(aprendizId, fichaId) {
    const estaMatriculado = await aprendizModel.verificarMatricula(aprendizId, fichaId);
    if (!estaMatriculado) {
        throw new Error('ACCESO_DENEGADO');
    }

    console.log("Intentando buscar semilla para ficha:", fichaId);
    const semilla = await aprendizModel.getSemillaFicha(fichaId);
    if (!semilla) {
        return { semilla: null, ovas: [] };
    }
    console.log("Semilla encontrada:", semilla);

    const ovas = await aprendizModel.getOvas(semilla.id);

    for (let ova of ovas) {
        ova.ciclos = await aprendizModel.getCiclos(ova.id);

        // 🚀 NUEVO: trae qué ciclos de esta OVA ya completó el aprendiz
        const progresoCiclos = await aprendizModel.obtenerProgresoCiclosPorOva(aprendizId, ova.id);
        const idsCiclosCompletados = new Set(progresoCiclos.map(p => p.ciclo_id));

        for (let ciclo of ova.ciclos) {
            const seccionesRaw = await aprendizModel.getSeccionesYRecursos(ciclo.id);
            
            const seccionesMap = {};

            seccionesRaw.forEach(row => {
                if (!seccionesMap[row.tipo_seccion]) {
                    seccionesMap[row.tipo_seccion] = {
                        id: row.seccion_id,
                        titulo: row.titulo,
                        contenido_html: row.contenido_html,
                        recursos: [],
                        tests: [],
                        enlaces: []
                    };
                }

                if (row.recurso_id && !seccionesMap[row.tipo_seccion].recursos.some(r => r.id === row.recurso_id)) {
                    seccionesMap[row.tipo_seccion].recursos.push({
                        id: row.recurso_id,
                        nombre_archivo: row.nombre_archivo,
                        url_r2: row.url_r2,
                        tipo_archivo: row.tipo_archivo,
                        key_r2: row.key_r2
                    });
                }

                if (row.test_id && !seccionesMap[row.tipo_seccion].tests.some(t => t.id === row.test_id)) {
                    seccionesMap[row.tipo_seccion].tests.push({
                        id: row.test_id,
                        nombre_test: row.nombre_test,
                        preguntas_json: row.preguntas_json
                    });
                }

                if (row.enlace_id && !seccionesMap[row.tipo_seccion].enlaces.some(e => e.id === row.enlace_id)) {
                    seccionesMap[row.tipo_seccion].enlaces.push({
                        id: row.enlace_id,
                        url: row.enlace_url,
                        etiqueta: row.enlace_etiqueta || 'Recurso externo'
                    });
                }
            });

            ciclo.secciones = seccionesMap;

            // 🚀 NUEVO: marca si este ciclo específico ya está completado
            ciclo.completado = idsCiclosCompletados.has(ciclo.id);
        }

        // 🚀 NUEVO: la OVA está completa solo si TODOS sus ciclos lo están
        ova.completado = ova.ciclos.length > 0 && ova.ciclos.every(c => c.completado);
    }

    return {
        semilla,
        ovas
    };
},

    async generarDescargaRecurso(recursoId) {
        const recurso = await aprendizModel.obtenerRecursoPorId(recursoId);
        if (!recurso) {
            throw new Error('RECURSO_NO_ENCONTRADO');
        }
        if (!recurso.key_r2) {
            throw new Error('RECURSO_SIN_KEY_R2'); // archivo subido antes de que existiera la key, o corrupto
        }

        const urlDescarga = await MaterialService.generarUrlDescarga(recurso.key_r2, recurso.nombre_archivo);
        return urlDescarga;
    }
};