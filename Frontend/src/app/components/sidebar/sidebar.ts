import { Component, inject } from '@angular/core';
import { LoginService } from '../../services/public/login-service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuOption {
  label: string;
  icon: string;
  route: string;
  roles: number[];
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
authService = inject(LoginService);
  
  // Lista maestra de navegación basada en tus roles de la DB
  readonly menuOptions: MenuOption[] = [
    // --- ROL: ADMIN (5) ---
    { label: 'Importar Excel', icon: 'upload', route: '/dashboard/importar', roles: [5] },
    { label: 'Test iniciales', icon: 'sparkles', route: '/dashboard/test', roles: [5] },
    { label: 'Gestión Usuarios', icon: 'users', route: '/dashboard/usuarios', roles: [5] },
    { label: 'Configuracion', icon: 'cog', route: '/dashboard/configuracion', roles: [5] },

    // --- ROL: INSTRUCTOR (2) ---
    { label: 'Panel Instructor', icon: 'briefcase', route: '/dashboard/instructor', roles: [2] },

    // --- ROL: APRENDIZ (1) ---
    { label: 'Panel Aprendiz', icon: 'book', route: '/dashboard/aprendiz', roles: [1] },

    // --- ROL: COORDINADOR (4) ---
    { label: 'Coordinación', icon: 'shield', route: '/dashboard/coordinador', roles: [4] },
    { label: 'Semillas', icon: 'file', route: '/dashboard/semillas', roles: [4] },
    { label: 'Expertos Tematicos', icon: 'users', route: '/dashboard/expertos', roles: [4] },
    { label: 'Instructores', icon: 'users', route: '/dashboard/instructores', roles: [4] },
    
    // --- ROL: EXPERTO TEMÁTICO (3) ---
    { label: 'Experto Temático', icon: 'star', route: '/dashboard/panel', roles: [3] },

    // --- ROL: RECTOR (6) ---
    { label: 'Panel Rectoría', icon: 'chart-bar', route: '/dashboard/rector', roles: [6] }
  ];

  // Filtramos las opciones según el rol del usuario actual
  menuFiltrado: MenuOption[] = [];

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.menuFiltrado = this.menuOptions.filter(option => 
        option.roles.includes(user.rol_id)
      );
    }
  }

  logout() {
    this.authService.logout();
  }
}
