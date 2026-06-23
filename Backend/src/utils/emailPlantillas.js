import { Resend } from 'resend';

const senaGreen = '#39A900';
const senaBlack = '#323232';

export const emailTemplates = {
  // 1: Aprendiz, 2: Instructor, 3: Experto, etc. (IDs de la DB)
  templates: {
    1: { // Aprendiz
      subject: '¡Bienvenido Aprendiz al Sistema SGO!',
      title: 'Hola Aprendiz,',
      body: 'Has sido invitado a la plataforma para gestionar tus actividades y objetos de aprendizaje.'
    },
    2: { // Instructor
      subject: 'Acceso Instructor - Plataforma SGO',
      title: 'Estimado Instructor,',
      body: 'Se le ha otorgado acceso para gestionar fichas, programas y evaluaciones de aprendices.'
    },
    3: { // Experto Temático
      subject: 'Invitación Colaborador: Experto Temático',
      title: 'Cordial saludo,',
      body: 'Requerimos su acceso para la validación técnica de los contenidos en SGO.'
    },
    4: { // Coordinador Académico
      subject: 'Control Académico SGO - Invitación',
      title: 'Respetado Coordinador,',
      body: 'Tiene disponible el acceso para la supervisión y reporte de centros de formación.'
    },
    5: { // Admin
      subject: 'ALERTA: Nuevo Acceso Administrativo SGO',
      title: 'Administrador,',
      body: 'Se ha generado un nuevo acceso con privilegios totales sobre el sistema.'
    },
    6: { // Rector
      subject: 'Acceso Institutional SGO',
      title: 'Señor Rector,',
      body: 'Invitación formal para el seguimiento de métricas institucionales del SENA.'
    }
  },

  // Método para invitaciones de roles administrativos (mediante token de registro)
  getHtml(rol_id, url) {
    const config = this.templates[rol_id] || this.templates[1]; // Por defecto aprendiz
    
    return `
      <div style="font-family: 'Poppins', sans-serif; border-top: 6px solid ${senaGreen}; padding: 30px; max-width: 600px; margin: auto; background-color: #f9f9f9; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <h2 style="color: ${senaBlack}; font-weight: 700;">${config.title}</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">${config.body}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: ${senaGreen}; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(57,169,0,0.2);">
            Activar mi Cuenta SGO
          </a>
        </div>
        <p style="font-size: 0.85rem; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
          Esta invitación es personal e intransferible y expira en 24 horas.<br>
          <strong>SGO - SENA Palmira</strong>
        </p>
      </div>
    `;
  },

  getAprendizTemplate(tipo, datos) {
    const urlLogin = `${process.env.FRONTEND_URL}/login`;
    
    const containerStyle = `
      font-family: 'Poppins', sans-serif; 
      padding: 30px; 
      max-width: 600px; 
      margin: auto; 
      background-color: #f9f9f9; 
      border-radius: 12px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    `;

    if (tipo === 'creado_y_matriculado') {
      return {
        subject: '🚀 ¡Bienvenido a SGO! - Tus credenciales de acceso',
        html: `
          <div style="${containerStyle} border-top: 6px solid ${senaGreen};">
            <h2 style="color: ${senaBlack}; font-weight: 700; margin-bottom: 4px;">¡Hola, ${datos.nombre}!</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin-top: 0;">Se ha generado tu cuenta en el Sistema de Gestión de OVA (SGO) para tu desarrollo de formación tecnológica en el SENA.</p>
            
            <div style="background-color: #ffffff; border-left: 4px solid ${senaGreen}; border-top: 1px solid #eee; border-right: 1px solid #eee; border-bottom: 1px solid #eee; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0 0 12px 0; font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: bold; letter-spacing: 1px;">Credenciales de acceso provisionales</p>
              <p style="margin: 6px 0; font-size: 14px; color: #323232;"><strong>Usuario / Correo:</strong> <span style="font-family: monospace; color: #555;">${datos.correo}</span></p>
              <p style="margin: 6px 0; font-size: 14px; color: #323232;"><strong>Contraseña temporal:</strong> <span style="font-family: monospace; background-color: #fef2f2; color: #dc2626; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${datos.contrasenaTemp}</span></p>
            </div>

            <p style="font-size: 13px; color: #ef4444; font-weight: 600; margin-bottom: 24px;">⚠️ Importante: Por normatividad de seguridad, la plataforma te solicitará cambiar esta clave provisional de forma obligatoria en tu primer ingreso.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${urlLogin}" style="background-color: ${senaGreen}; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(57,169,0,0.2);">
                Ingresar a la Plataforma
              </a>
            </div>
            <p style="font-size: 0.85rem; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
              <strong>SGO - SENA Palmira</strong>
            </p>
          </div>
        `
      };
    } else {
      // Caso: 'matriculado' (Usuario que ya existía previamente en la DB)
      return {
        subject: '📚 Nueva ficha vinculada en SGO',
        html: `
          <div style="${containerStyle} border-top: 6px solid #0066cc;">
            <h2 style="color: ${senaBlack}; font-weight: 700; margin-bottom: 4px;">¡Hola de nuevo, ${datos.nombre}!</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin-top: 0;">Te notificamos que has sido matriculado en una nueva ficha de caracterización para tu seguimiento en SGO.</p>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #166534; border-top: 1px solid #bbf7d0; border-right: 1px solid #bbf7d0; border-bottom: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 24px 0; color: #166534; font-weight: 500; font-size: 14px;">
              ℹ️ Tu cuenta en el sistema se encuentra totalmente activa. Puedes acceder inmediatamente utilizando tu correo institucional y la clave personal que tienes configurada actualmente.
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${urlLogin}" style="background-color: #0066cc; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(0,102,204,0.2);">
                Ver mis Fichas Activas
              </a>
            </div>
            <p style="font-size: 0.85rem; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
              <strong>SGO - SENA Palmira</strong>
            </p>
          </div>
        `
      };
    }
  },
  
  getPlantillaMatriculaFicha(datos) {
    const senaGreen = '#39A900';
    const senaBlack = '#323232';
    const urlLogin = `${process.env.FRONTEND_URL}/login`;
    
    let htmlCredenciales = '';
    
    if (datos.esNuevo) {
        htmlCredenciales = `
            <div style="background-color: #ffffff; border-left: 4px solid ${senaGreen}; border: 1px solid #eee; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0 0 12px 0; font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: bold;">Credenciales de acceso provisionales</p>
              <p style="margin: 6px 0; font-size: 14px; color: #323232;"><strong>Usuario / Correo:</strong> <span style="font-family: monospace;">${datos.correo}</span></p>
              <p style="margin: 6px 0; font-size: 14px; color: #323232;"><strong>Contraseña temporal:</strong> <span style="font-family: monospace; background-color: #fef2f2; color: #dc2626; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${datos.contrasenaTemp}</span></p>
              <p style="margin-top: 10px; font-size: 12px; color: #ef4444;">Recuerda cambiar tu contraseña al ingresar.</p>
            </div>
        `;
    }

    return `
      <div style="font-family: 'Poppins', sans-serif; border-top: 6px solid ${senaGreen}; padding: 30px; max-width: 600px; margin: auto; background-color: #f9f9f9; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <h2 style="color: ${senaBlack}; font-weight: 700;">¡Hola, ${datos.nombre}!</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Te informamos oficialmente que has sido matriculado en el sistema SGO y vinculado a la ficha de formación <strong>${datos.codigo_ficha}</strong>.
        </p>
        
        <div style="background-color: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 6px;">
          <p style="color: #0369a1; font-size: 14px; margin: 0; font-weight: 500;">
            <strong>Próximos pasos:</strong> Posteriormente serás vinculado a una de nuestras <strong>semillas</strong> para dar inicio formal al desarrollo de tu programa de formación. Te notificaremos cuando esto ocurra.
          </p>
        </div>

        ${htmlCredenciales}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${urlLogin}" style="background-color: ${senaGreen}; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Ingresar a la Plataforma SGO
          </a>
        </div>
        <p style="font-size: 0.85rem; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
          <strong>SGO - SENA Palmira</strong>
        </p>
      </div>
    `;
  }
};