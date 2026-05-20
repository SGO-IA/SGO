import { Component, inject, signal } from '@angular/core';
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
  standalone: true, // Asegúrate de tenerlo si usas Angular moderno
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  authService = inject(LoginService);
  
  // NUEVO: Señal para controlar la apertura del menú en dispositivos móviles
  isMobileMenuOpen = signal<boolean>(false);
  
  readonly menuOptions: MenuOption[] = [
    { label: 'Importar Excel', icon: 'upload', route: '/dashboard/importar', roles: [5] },
    { label: 'Test iniciales', icon: 'sparkles', route: '/dashboard/test', roles: [5] },
    { label: 'Gestión Usuarios', icon: 'users', route: '/dashboard/usuarios', roles: [5] },
    { label: 'Configuracion', icon: 'cog', route: '/dashboard/configuracion', roles: [5] },
    { label: 'Panel Instructor', icon: 'briefcase', route: '/dashboard/instructor', roles: [2] },
    { label: 'Panel Aprendiz', icon: 'book', route: '/dashboard/aprendiz', roles: [1] },
    { label: 'Coordinación', icon: 'shield', route: '/dashboard/coordinador', roles: [4] },
    { label: 'Semillas', icon: 'file', route: '/dashboard/semillas', roles: [4] },
    { label: 'Expertos Tematicos', icon: 'users', route: '/dashboard/expertos', roles: [4] },
    { label: 'Instructores', icon: 'users', route: '/dashboard/instructores', roles: [4] },
    { label: 'Experto Temático', icon: 'star', route: '/dashboard/panel', roles: [3] },
    { label: 'Panel Rectoría', icon: 'chart-bar', route: '/dashboard/rector', roles: [6] }
  ];

  menuFiltrado: MenuOption[] = [];

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.menuFiltrado = this.menuOptions.filter(option => 
        option.roles.includes(user.rol_id)
      );
    }
  }

  // NUEVO: Alternar estado del menú
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  // NUEVO: Cerrar el menú al dar clic en un enlace para mejorar la UX móvil
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }
}