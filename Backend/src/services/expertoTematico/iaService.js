import { RAPModel } from '../../models/expertoTematico/iaModel.js';
import { generarPromptPedagogico } from '../../prompts/expertoTematico/cicloDidactico.js';
import { anthropic, anthropicConfig } from '../../config/claude.js';

export const IAService = {
  obtenerSugerencia: async (prompt, etapa, rapId) => {
    // 1. Obtener datos del Modelo
    const data = await RAPModel.getContextoCompleto(rapId);
    
    const contextoIA = data ? `
      RAP: ${data.rap_nombre}
      Conocimientos de Proceso: ${data.conocimientos_proceso || 'N/A'}
      Conocimientos del Saber: ${data.conocimientos_saber || 'N/A'}
      Criterios de Evaluación: ${data.criterios_evaluacion || 'N/A'}
    ` : 'Información técnica no encontrada para este RAP.';

    // 2. Obtener el prompt centralizado
    const content = generarPromptPedagogico(etapa, contextoIA, prompt);

    // 3. Llamada a Anthropic
    const response = await anthropic.messages.create({
      model: anthropicConfig.model,
      max_tokens: anthropicConfig.maxTokens,
      messages: [{ role: 'user', content }]
    });

    return response.content[0].text;
  }
};