import { IAService } from '../../services/expertoTematico/iaService.js';

export const IAController = {
  generarSugerencia: async (req, res) => {
    try {
      // Recibimos prompt, etapa y rapId desde el frontend
      const { prompt, etapa, rapId } = req.body;
      
      // Si el prompt viene vacío (el usuario no escribió nada), asignamos una instrucción por defecto
      const instruccionFinal = prompt && prompt.trim() !== '' 
        ? prompt 
        : "Diseña una actividad completa siguiendo la estructura requerida.";

      const sugerencia = await IAService.obtenerSugerencia(instruccionFinal, etapa, rapId);
      res.status(200).json({ sugerencia });
    } catch (error) {
      console.error("❌ Error en IAController:", error);
      res.status(500).json({ error: error.message });
    }
  }
};