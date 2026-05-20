import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { LoginService } from '../../services/public/login-service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { NavigationService } from '../../services/shared/navigation';

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
  menuFiltrado: any[] = [];

  constructor() {
    // Escuchamos de forma automática los cambios en el menú para aplicar el filtro de rol
    effect(() => {
      const user = this.authService.currentUser();
      const opcionesActuales = this.navService.currentMenuOptions();
      
      if (user) {
        this.menuFiltrado = opcionesActuales.filter(option => 
          option.roles.includes(user.rol_id)
        );
      }
    });
  }

  ngOnInit(): void {
    // 🧠 DETECTOR DE RUTAS: Analiza a dónde se está moviendo el usuario
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      
      // Si la ruta contiene 'dashboard/semilla/', extraemos el ID de la URL
      if (url.includes('dashboard/semilla/')) {
        const segmentos = url.split('/');
        const index = segmentos.indexOf('semilla');
        const semillaId = segmentos[index + 1]; // Toma el ID que viene justo después
        
        if (semillaId) {
          this.navService.setMenuInternoSemilla(semillaId);
        }
      } else {
        // Si sale de la semilla a cualquier otra parte, limpia y recupera el menú principal
        this.navService.setMenuGlobal();
      }
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