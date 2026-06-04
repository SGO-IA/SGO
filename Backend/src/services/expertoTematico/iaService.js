import { RAPModel } from '../../models/expertoTematico/iaModel.js';
import { generarPromptPedagogico } from '../../prompts/expertoTematico/cicloDidactico.js';
import { anthropic, anthropicConfig } from '../../config/claude.js';

export const IAService = {
  obtenerSugerencia: async (instruccion, etapa, rapId) => {
    // 1. Obtener contexto del Modelo (Data Layer)
    const data = await RAPModel.getContextoCompleto(rapId);
    
    // 2. Formatear contexto para la IA (Business Logic Layer)
    const contextoIA = data ? `
      RAP: ${data.rap_nombre}
      Conocimientos de Proceso: ${data.conocimientos_proceso || 'N/A'}
      Conocimientos del Saber: ${data.conocimientos_saber || 'N/A'}
      Criterios de Evaluación: ${data.criterios_evaluacion || 'N/A'}
    ` : 'Data not found.';

    // 3. Generar el prompt final (Prompt Layer)
    const content = generarPromptPedagogico(etapa, contextoIA, instruccion);

    // LOG DE DEPURACIÓN: Muestra lo que se envía a la IA
    console.log("------------------ PROMPT ENVIADO A LA IA ------------------");
    console.log(content);
    console.log("-----------------------------------------------------------");

    // 4. Invocación a la API (Integration Layer)
    const response = await anthropic.messages.create({
      model: anthropicConfig.model,
      max_tokens: anthropicConfig.maxTokens,
      messages: [{ role: 'user', content }]
    });

    return response.content[0].text;
  }
};