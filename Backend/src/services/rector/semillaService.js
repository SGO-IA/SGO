import { semillaRectorModel } from '../../models/rector/semillasModels.js';

export const semillaRectorService = {
    async getSemillasParaRevision() {
        const semillas = await semillaRectorModel.obtenerSemillasPendientes();
        
        // Formateo de datos para enviarle una estructura más limpia a Angular
        return semillas.map(semilla => ({
            ...semilla,
            etiqueta_programa: `${semilla.programa_codigo} - V${semilla.programa_version}`
        }));
    },

    async getDetalleRevision(semillaId) {
        // Ejecutamos las 3 consultas al mismo tiempo para máxima velocidad
        const [detalleBase, expertos, ovas] = await Promise.all([
            semillaRectorModel.getDetalleBasico(semillaId),
            semillaRectorModel.getExpertosAsignados(semillaId),
            semillaRectorModel.getOvasDetalle(semillaId)
        ]);

        if (!detalleBase) {
            throw new Error(`No se encontró la semilla con ID ${semillaId}`);
        }

        // Ensamblamos la radiografía completa
        return {
            ...detalleBase,
            etiqueta_programa: `${detalleBase.programa_codigo} - V${detalleBase.programa_version}`,
            total_expertos: expertos.length,
            expertos: expertos,
            total_ovas: ovas.length,
            ovas: ovas
        };
    }
};