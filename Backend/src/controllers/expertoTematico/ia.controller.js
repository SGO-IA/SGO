import { IAService } from '../../services/expertoTematico/iaService.js';

export const IAController = {
  generarSugerencia: async (req, res) => {
    console.log("📥 IA Controller recibiendo:", req.body); // Log de entrada
    try {
      const { prompt, etapa, rapId } = req.body;
      const sugerencia = await IAService.obtenerSugerencia(prompt, etapa, rapId);
      res.status(200).json({ sugerencia });
    } catch (error) {
      console.error("❌ Error capturado en IAController:", error); // Log de error
      res.status(500).json({ error: error.message });
    }
  }
};