import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface MenuOption {
  label: string;
  icon: string;
  route: string;
  roles: number[];
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  // Las opciones estándar de la plataforma global de SGO
  readonly menuGlobal: MenuOption[] = [
    { label: 'Importar Excel', icon: 'upload', route: '/dashboard/importar', roles: [5] },
    { label: 'Test iniciales', icon: 'sparkles', route: '/dashboard/test', roles: [5] },
    { label: 'Gestión Usuarios', icon: 'users', route: '/dashboard/usuarios', roles: [5] },
    { label: 'Configuracion', icon: 'cog', route: '/dashboard/configuracion', roles: [5] },
    { label: 'Panel Instructor', icon: 'briefcase', route: '/dashboard/instructor', roles: [2] },
    { label: 'Panel Aprendiz', icon: 'book', route: '/dashboard/aprendiz', roles: [1] },
    // { label: 'Coordinación', icon: 'shield', route: '/dashboard/coordinador', roles: [4] },
    { label: 'Semillas', icon: 'file', route: '/dashboard/semillas', roles: [4] },
    { label: 'Expertos Tematicos', icon: 'users', route: '/dashboard/expertos', roles: [4] },
    { label: 'Publicar semillas', icon: 'users', route: '/dashboard/publicar', roles: [4] },
    // { label: 'Instructores', icon: 'users', route: '/dashboard/instructores', roles: [4] },
    { label: 'Experto Temático', icon: 'star', route: '/dashboard/panel', roles: [3] },
    { label: 'Panel Rectoría', icon: 'chart-bar', route: '/dashboard/rector', roles: [6] }
  ];

  // 🔔 Signal que lee el sidebar. Cambia de contenido dinámicamente.
currentMenuOptions = signal<MenuOption[]>([]);

  constructor(private router: Router) {
    // 2. Verificación inmediata al instanciar el servicio
    this.detectarYAplicarMenu(this.router.url);
  }

  detectarYAplicarMenu(url: string) {
    if (url.includes('/dashboard/semilla/')) {
      const segmentos = url.split('/');
      const index = segmentos.indexOf('semilla');
      if (index !== -1 && segmentos[index + 1]) {
        this.setMenuInternoSemilla(segmentos[index + 1]);
      }
    } else {
      this.setMenuGlobal();
    }
  }

  setMenuGlobal() { this.currentMenuOptions.set(this.menuGlobal); }

  setMenuInternoSemilla(semillaId: string) {
    this.currentMenuOptions.set([
      { label: 'RAPs', icon: 'sitemap', route: `/dashboard/semilla/${semillaId}`, roles: [3] },
      { label: 'Ciclo Didáctico', icon: 'sync', route: `/dashboard/semilla/${semillaId}/ciclo-didactico`, roles: [3] },
      { label: 'Volver a Mis Semillas', icon: 'arrow-left', route: '/dashboard/panel', roles: [3] },
    ]);
  }
}