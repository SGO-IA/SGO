import { semillaRectorModel } from '../../models/rector/semillasModels.js';

export const semillaRectorService = {
    async getSemillasParaRevision() {
        const semillas = await semillaRectorModel.obtenerSemillasPendientes();
        
        // Formateo de datos para enviarle una estructura más limpia a Angular
        return semillas.map(semilla => ({
            ...semilla,
            etiqueta_programa: `${semilla.programa_codigo} - V${semilla.programa_version}`
        }));
    }
};