import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../services/public/login-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  mostrarInvitacion = false;
  errorLogin: string | null = null;
  correo: string = '';
  contrasena: string = '';
  cargandoManual: boolean = false;

  // Diccionario de mensajes amigables
  private readonly MENSAJES_ERROR: Record<string, string> = {
    'auth-google': 'No tienes acceso con esta cuenta institucional. Contacta al administrador si crees que es un error.',
    'unauthorized': 'No tienes permisos para ingresar al sistema.',
    'no-invitation': 'No se encontró una invitación válida para este correo.',
    'default': 'Ocurrió un problema al intentar iniciar sesión.'
  };

  constructor(
    private route: ActivatedRoute,
    private authService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['invitation'] === 'true') {
        this.mostrarInvitacion = true;
      }

      const errorCod = params['error'];
      if (errorCod) {
        // Mapeamos el código al mensaje amigable
        this.errorLogin = this.MENSAJES_ERROR[errorCod] || this.MENSAJES_ERROR['default'];
        this.mostrarInvitacion = false;
      }
    });
  }

  loginConGoogle(): void {
    this.authService.loginWithGoogle();
  }

  iniciarSesionManual(): void {
    if (!this.correo || !this.contrasena) {
      this.errorLogin = 'Por favor, ingresa tu correo y contraseña.';
      return;
    }

    this.cargandoManual = true;
    this.errorLogin = null;

    this.authService.loginConCredenciales(this.correo, this.contrasena).subscribe({
      next: (res) => {
        this.cargandoManual = false;
        if (res.autenticado) {
          // Actualizamos el Signal global de usuario
          this.authService.currentUser.set(res.usuario);
          // Redirigimos al dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.cargandoManual = false;
        // Mostramos el mensaje exacto que nos devolvió el backend
        this.errorLogin = err.error?.mensaje || 'Error de conexión con el servidor.';
      }
    });
  }
}