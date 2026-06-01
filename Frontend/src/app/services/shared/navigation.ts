import { Injectable, signal } from '@angular/core';

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
    // { label: 'Instructores', icon: 'users', route: '/dashboard/instructores', roles: [4] },
    { label: 'Experto Temático', icon: 'star', route: '/dashboard/panel', roles: [3] },
    { label: 'Panel Rectoría', icon: 'chart-bar', route: '/dashboard/rector', roles: [6] }
  ];

  // 🔔 Signal que lee el sidebar. Cambia de contenido dinámicamente.
  currentMenuOptions = signal<MenuOption[]>(this.menuGlobal);

  // Método para volver a los accesos del rol estándar
  setMenuGlobal() {
    this.currentMenuOptions.set(this.menuGlobal);
  }

  // Método para inyectar el submenú de construcción de la semilla con su ID real
  setMenuInternoSemilla(semillaId: string) {
    this.currentMenuOptions.set([
      { 
        label: 'Estructura (RAPs / OVAs)', 
        icon: 'pi pi-sitemap', // Icono de árbol/estructura pedagógica
        route: `/dashboard/semilla/${semillaId}`, 
        roles: [3] 
      },
      { 
        label: 'Ciclo Didáctico', 
        icon: 'pi pi-sync', // Icono semántico de proceso cíclico / iterativo
        route: `/dashboard/semilla/${semillaId}/ciclo-didactico`, 
        roles: [3] 
      },
      { 
        label: 'Volver a Mis Semillas', 
        icon: 'pi pi-arrow-left', // Icono estándar de retorno
        route: '/dashboard/panel', 
        roles: [3] 
      },
    ]);
  }
}