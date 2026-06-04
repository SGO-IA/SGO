import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { LoginService } from '../../services/public/login-service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { MenuOption, NavigationService } from '../../services/shared/navigation';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  authService = inject(LoginService);
  private navService = inject(NavigationService);
  private router = inject(Router);
  
  isMobileMenuOpen = signal<boolean>(false);
  menuFiltrado = signal<MenuOption[]>([]);

  constructor() {
    // Escucha cambios en el usuario O cambios en las opciones del menú
    effect(() => {
      const user = this.authService.currentUser();
      const opciones = this.navService.currentMenuOptions();
      
      if (user && opciones.length > 0) {
        this.menuFiltrado.set(opciones.filter(op => op.roles.includes(user.rol_id)));
      }
    });
  }

  ngOnInit(): void {
      // Solo necesitamos escuchar los cambios de navegación para actualizar el servicio
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.navService.detectarYAplicarMenu(event.urlAfterRedirects || event.url);
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }
}