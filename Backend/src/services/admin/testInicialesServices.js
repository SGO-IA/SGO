import { iaModel } from '../../models/admin/testInicialModel.js';
import { claudeProvider } from '../../services/claude/claudeService.js';
import { IA_PROMPTS } from '../../prompts/prompts.js';

export const iaService = {
    listarProgramasYCompetencias: async () => {
        // Obtenemos los programas y sus competencias asociadas
        return await iaModel.getProgramasWithCompetencias();
    },

    obtenerDetalleParaIA: async (competenciaId) => {
        // Traemos toda la "carne" de la competencia: RAPs, Saber, Proceso y Criterios
        // Esto es vital para que el prompt de la IA sea preciso
        const raps = await iaModel.getEstructuraPedagogica(competenciaId);
        
        return {
            competenciaId,
            totalRaps: raps.length,
            estructura: raps
        };
    },

    generarTestTecnico: async (payload) => {
        // 1. Extraemos con seguridad
        const { competenciaId, ...configuracionIA } = payload;

        // 2. CORRECCIÓN AQUÍ: Llamamos directamente al modelo para obtener los RAPs
        const raps = await iaModel.getEstructuraPedagogica(competenciaId ?? null);

        // Barajear los raps para que la IA no siempre genere lo mismo
        const rapsBarajados = raps.sort(() => Math.random() - 0.5);
        
        // 3. Construimos el objeto 'detalle' manualmente para el prompt
        const datosCurriculares = rapsBarajados.map(r => ({
            id: r.codigo_rap,
            // Limpiamos espacios múltiples y saltos de línea en el título
            tema: r.rap_nombre.replace(/\s+/g, ' ').trim(),
            
            // Limpiamos los arrays de saberes y procesos
            conocimientos: r.saberes.map(s => 
                s.replace(/[*]/g, '')     // Elimina asteriscos decorativos
                .replace(/\n/g, ' ')      // Cambia saltos de línea por espacios
                .replace(/\s+/g, ' ')     // Colapsa espacios múltiples
                .trim()
            ),
            procesos: r.procesos.map(p => 
                p.replace(/[*]/g, '')
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
            )
        }));

        const detalle = {
            competenciaId,
            totalRaps: raps.length,
            estructura: datosCurriculares
        };

        console.log("DEBUG - Estructura enviada a la IA:", JSON.stringify(detalle.estructura, null, 2));

        // 4. Extracción y construcción del prompt
        const { system, user } = IA_PROMPTS.GENERAR_TEST;
        const promptDinamico = user(detalle, configuracionIA);

        // 5. Ejecución de la IA
        const resultadoIA = await claudeProvider.ask(promptDinamico, system);

        // 6. LIMPIEZA DE SEGURIDAD
        if (resultadoIA.ok && resultadoIA.data) {
            const jsonMatch = resultadoIA.data.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                resultadoIA.data = jsonMatch[0];
            }
        }

        return {
            ...resultadoIA,
            competenciaId
        };
    },

    verificarExistenciaTest: async (competenciaId) => {
        const test = await iaModel.obtenerTestPorCompetencia(competenciaId);
        
        if (!test) return null;

        // Parseo de JSON si la DB lo devuelve como string
        return {
            ...test,
            preguntas_json: typeof test.preguntas_json === 'string' 
                ? JSON.parse(test.preguntas_json) 
                : test.preguntas_json
        };
    }
};