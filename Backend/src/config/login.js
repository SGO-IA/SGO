import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import pool from './dbConfig.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    const googleId = profile.id;
    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
    const displayName = profile.displayName;

    if (!email) {
      return done(null, false, { message: "No se pudo obtener el correo de Google" });
    }

    try {
      // 1. Verificar si el usuario ya existe (por ID de Google o por Correo)
      const [userRows] = await pool.query(
        'SELECT * FROM usuarios WHERE google_id = ? OR correo = ?', 
        [googleId, email]
      );

      if (userRows.length > 0) {
        const user = userRows[0];

        // --- VALIDACIÓN DE ESTADO ACTIVO ---
        if (!user.activo) {
          // Si el usuario está desactivado, no lo dejamos pasar
          return done(null, false, { message: 'Tu cuenta ha sido desactivada. Contacta al administrador.' });
        }

        // Si el usuario existe por correo pero no tiene vinculado el Google ID, lo vinculamos
        if (!user.google_id) {
          await pool.query(
            'UPDATE usuarios SET google_id = ? WHERE id = ?',
            [googleId, user.id]
          );
          user.google_id = googleId;
        }
        return done(null, user);
      }

      // 2. Si no existe, es un registro nuevo. VALIDAR INVITACIÓN
      const [invitacionRows] = await pool.query(
        'SELECT * FROM invitaciones WHERE correo = ? AND usado = FALSE AND expiracion > NOW()',
        [email]
      );

      if (invitacionRows.length === 0) {
        // No hay invitación -> Bloqueamos el acceso
        return done(null, false, { message: 'No tienes una invitación válida.' });
      }

      const invitacion = invitacionRows[0];

      // 3. CREAR EL USUARIO con el rol de la invitación
      const [result] = await pool.query(
        `INSERT INTO usuarios (rol_id, nombre, correo, google_id, activo) 
         VALUES (?, ?, ?, ?, TRUE)`,
        [invitacion.rol_id, displayName, email, googleId]
      );

      const newUserId = result.insertId;

      // 4. MARCAR INVITACIÓN COMO USADA
      await pool.query(
        'UPDATE invitaciones SET usado = TRUE WHERE invitacion_id = ?',
        [invitacion.invitacion_id]
      );

      // Retornar el usuario recién creado
      const [newUser] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [newUserId]);
      return done(null, newUser[0]);

    } catch (error) {
      console.error("Error en Estrategia SGO:", error);
      return done(error, null);
    }
  }
));

passport.use(new LocalStrategy({
    usernameField: 'correo',    // El frontend enviará el campo 'correo'
    passwordField: 'contrasena' // El frontend enviará el campo 'contrasena'
  },
  async (correo, contrasena, done) => {
    try {
      // 1. Buscamos al usuario por correo
      const [userRows] = await pool.query('SELECT * FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
      
      if (userRows.length === 0) {
        return done(null, false, { message: 'El correo o la contraseña son incorrectos.' });
      }

      const user = userRows[0];

      // 2. Validar que esté activo
      if (!user.activo) {
        return done(null, false, { message: 'Tu cuenta ha sido desactivada. Contacta al administrador.' });
      }

      // 3. Validar si es un usuario que solo usa Google (no tiene contraseña local)
      if (!user.contrasena) {
        return done(null, false, { message: 'Este correo está vinculado a Google. Usa el botón de iniciar sesión con Google.' });
      }

      // 4. Comparar la contraseña ingresada con el hash de la BD
      const esValida = await bcrypt.compare(contrasena, user.contrasena);
      if (!esValida) {
        return done(null, false, { message: 'El correo o la contraseña son incorrectos.' });
      }

      // 5. ¡Éxito! Retornamos el usuario para que Passport cree la sesión
      return done(null, user);

    } catch (error) {
      console.error("Error en Estrategia Local:", error);
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (rows.length === 0) return done(null, false);
        done(null, rows[0]);
    } catch (error) {
        done(error, null);
    }
});

export default passport;