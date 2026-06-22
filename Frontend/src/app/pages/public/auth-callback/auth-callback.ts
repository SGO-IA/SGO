import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/public/login-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: '<p>Redirigiendo...</p>',
})
export class AuthCallback implements OnInit {
  
  // Definimos el mapa de rutas por ID de Rol
  private readonly ROLE_ROUTES: Record<number, string> = {
    1: '/dashboard/aprendiz',
    2: '/dashboard/instructor',
    3: '/dashboard/panel',
    4: '/dashboard/semillas',
    5: '/dashboard/importar',
    6: '/dashboard/rector'
  };

  constructor(private authService: LoginService, private router: Router) {}

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        if (res.autenticado && res.usuario) {
          const rolId = res.usuario.rol_id;
          
          // Buscamos la ruta en el mapa, si no existe mandamos al inicio
          const targetRoute = this.ROLE_ROUTES[rolId] || '/';
          
          this.router.navigate([targetRoute]);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('Error en el callback de autenticación:', err);
        this.router.navigate(['/login']);
      }
    });
  }
}