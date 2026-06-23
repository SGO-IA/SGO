import bcrypt from 'bcrypt';
import { emailTemplates } from '../../utils/emailPlantillas.js';
import { Resend } from 'resend';
import db from '../../config/dbConfig.js';
import { coordinadorSelectoresModel } from '../../models/coordinador/selectoresModels.js';

const resend = new Resend(process.env.RESEND_API_KEY);

function generarContrasenaTemp(longitud = 10) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    return Array.from({ length: longitud }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const coordinadorSelectoresService = {
    async listarFichas(programaId) {
        return await coordinadorSelectoresModel.getFichasDisponibles(programaId);
    },

    async listarInstructores() {
        return await coordinadorSelectoresModel.getInstructoresActivos();
    },

    async listarCompetencias(programaId) {
        return await coordinadorSelectoresModel.getCompetenciasPorPrograma(programaId);
    },

    async listarFichasConSusAprendices() {
        const filasSql = await coordinadorSelectoresModel.obtenerFichasYAprendices();

        const fichasMap = new Map();

        for (const fila of filasSql) {
            // Inicializar la ficha si no existe en el Map
            if (!fichasMap.has(fila.ficha_id)) {
                fichasMap.set(fila.ficha_id, {
                    fichaId: fila.ficha_id,
                    codigoFicha: fila.codigo_ficha,
                    programaNombre: fila.programa_nombre || 'Sin programa',
                    totalAprendices: 0,
                    aprendices: []
                });
            }

            // Si hay un aprendiz en esta fila, lo agregamos al array de la ficha
            if (fila.aprendiz_id) {
                const ficha = fichasMap.get(fila.ficha_id);
                ficha.aprendices.push({
                    id: fila.aprendiz_id,
                    nombre: fila.aprendiz_nombre,
                    correo: fila.aprendiz_correo,
                    activo: fila.aprendiz_activo
                });
                ficha.totalAprendices++;
            }
        }

        return Array.from(fichasMap.values());
    },

    async crearFichaYMatricular(datosFicha, correosAprendices) {
        const conn = await db.getConnection();
        const resultadosCorreos = [];

        try {
            await conn.beginTransaction();

            // 1. Crear la ficha
            const nuevaFichaId = await coordinadorSelectoresModel.insertarFicha(conn, datosFicha);

            // 2. Procesar aprendices
            for (const correo of correosAprendices) {
                let usuario = await coordinadorSelectoresModel.buscarUsuarioPorCorreo(conn, correo);
                let esNuevo = false;
                let contrasenaTemp = null;

                // Si no existe, lo creamos
                if (!usuario) {
                    contrasenaTemp = generarContrasenaTemp();
                    const hash = await bcrypt.hash(contrasenaTemp, 10);
                    usuario = await coordinadorSelectoresModel.crearAprendiz(conn, correo, hash);
                    esNuevo = true;
                }

                // Matricular en la tabla puente
                await coordinadorSelectoresModel.matricularAprendiz(conn, usuario.id, nuevaFichaId);

                // Guardar info para disparar el correo después del commit
                resultadosCorreos.push({
                    correo: correo,
                    nombre: usuario.nombre,
                    codigo_ficha: datosFicha.codigo_ficha,
                    esNuevo: esNuevo,
                    contrasenaTemp: contrasenaTemp
                });
            }

            await conn.commit();

            // 3. Disparar correos en paralelo (sin bloquear el response si uno falla)
            if (resultadosCorreos.length > 0) {
                const promesasEnvio = resultadosCorreos.map(async (info) => {
                    try {
                        const htmlContent = emailTemplates.getPlantillaMatriculaFicha(info);
                        await resend.emails.send({
                            from: 'SGO SENA <soporte@solodeploy.com>',
                            to: info.correo,
                            subject: `SGO - Has sido vinculado a la ficha ${info.codigo_ficha}`,
                            html: htmlContent
                        });
                    } catch (err) {
                        console.error(`❌ Error enviando correo a ${info.correo}:`, err.message);
                    }
                });
                await Promise.all(promesasEnvio);
            }

            return {
                fichaId: nuevaFichaId,
                totalMatriculados: resultadosCorreos.length
            };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    async obtenerProgramas() {
        return await coordinadorSelectoresModel.listarProgramas();
    },
    async obtenerCentros() {
        return await coordinadorSelectoresModel.listarCentros();
    }
};