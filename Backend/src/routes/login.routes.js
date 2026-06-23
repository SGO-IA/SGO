import { Router } from 'express';
import passport from 'passport';
import pool from '../config/dbConfig.js';

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

// 1. Iniciar autenticación Google
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' 
}));

// Añade esta ruta en tu archivo de rutas de autenticación
router.post('/login-local', (req, res, next) => {
    // Llamamos a la estrategia local que acabamos de crear
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ autenticado: false, mensaje: "Error interno del servidor." });
        }
        
        if (!user) {
            // Retorna el mensaje de error definido en la estrategia (ej. Credenciales incorrectas)
            return res.status(401).json({ autenticado: false, mensaje: info.message });
        }

        // Creamos la sesión manualmente
        req.logIn(user, (loginErr) => {
            if (loginErr) {
                return res.status(500).json({ autenticado: false, mensaje: "Error al crear la sesión." });
            }
            
            // Limpiamos la contraseña antes de mandar los datos al frontend
            const { contrasena, ...usuarioLimpio } = user;
            
            return res.status(200).json({
                autenticado: true,
                mensaje: "Inicio de sesión exitoso.",
                usuario: usuarioLimpio
            });
        });
    })(req, res, next);
});

// 2. Obtener perfil actual
router.get('/perfil', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            autenticado: true,
            usuario: req.user
        });
    } else {
        res.status(401).json({ 
            autenticado: false, 
            mensaje: "No hay una sesión activa" 
        });
    }
});

// 3. Callback de Google
router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: `${FRONTEND_URL}/login?error=auth-google`, 
        session: true 
    }),
    (req, res) => {
        // En tu nueva DB, si el usuario existe, mandamos al dashboard directamente
        // Si es un flujo de registro nuevo, passport ya debería haberlo creado en la estrategia
        return res.redirect(`${FRONTEND_URL}/auth-callback`);
    }
);

// 4. Completar registro (Adaptado a tu nueva tabla 'usuarios')
// Nota: Aquí registramos el teléfono que pediste en el frontend
router.post('/completar-registro', async (req, res) => {
    try {
        const { id, telefono_principal } = req.body; 

        if (!id) return res.status(400).json({ mensaje: "Falta ID de usuario" });

        const sqlUpdate = `
            UPDATE usuarios 
            SET telefono_principal = ?
            WHERE id = ?`;
        
        const [result] = await pool.query(sqlUpdate, [
            telefono_principal, 
            id
        ]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                mensaje: "Usuario no encontrado" 
            });
        }

        return res.json({ completado: true });

    } catch (err) {
        console.error("ERROR AL COMPLETAR REGISTRO SCOOBY:", err);
        return res.status(500).json({ error: err.message });
    }
} );

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        
        // Destruye la sesión de Express
        req.session.destroy(() => {
            res.clearCookie('connect.sid'); // Limpia la cookie del navegador
            res.json({ mensaje: "Sesión cerrada correctamente" });
        });
    });
});

export default router;