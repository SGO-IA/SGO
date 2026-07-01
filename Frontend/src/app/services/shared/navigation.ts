import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface MenuOption {
  id?: number;
  label: string;
  icon: string;
  route: string | null;
  roles: number[];
  accion?: (data?: any) => void;
  nivel?: number;      // <--- Añade el ? aquí
  isOpen?: boolean;    // <--- Añade el ? aquí
  children?: MenuOption[]; // <--- Añade el ? aquí
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  cicloSeleccionado = signal<any>(null);
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
    { label: 'Fichas', icon: 'users', route: '/dashboard/fichas', roles: [4] },
    // { label: 'Instructores', icon: 'users', route: '/dashboard/instructores', roles: [4] },
    { label: 'Experto Temático', icon: 'star', route: '/dashboard/panel', roles: [3] },
    { label: 'Panel Rectoría', icon: 'chart-bar', route: '/dashboard/rector', roles: [6] },
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
    } 
    // 🔥 EL SALVAVIDAS DEL SIDEBAR DEL APRENDIZ
    else if (url.includes('/dashboard/aprendiz/entorno')) {
      // Al entrar aquí, evitamos que se ejecute setMenuGlobal().
      // El menú conservará el árbol de OVAS y Ciclos que cargamos desde la base de datos.
      
      // Opcional: Si implementaste el método para mantener abierto el acordeón, lo llamas aquí:
      // this.autoExpandirMenuPorUrl(url); 
    } 
    // Para el resto de rutas de la plataforma, cargamos el menú global
    else {
      this.setMenuGlobal();
      // Limpiamos la selección activa para que no quede pegada si sale a otra vista
      this.cicloSeleccionado.set(null);
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

setMenuEntornoAprendiz(ovas: any[]) {
  const menuDinamico: MenuOption[] = [
    { 
      label: 'Volver a Mis Fichas', 
      icon: 'arrow-left', 
      route: '/dashboard/aprendiz', 
      roles: [1],
      nivel: -1, // Nivel raíz especial
      accion: () => this.cicloSeleccionado.set(null) 
    }
  ];

  ovas.forEach((ova, i) => {
    // 1. OVA (Nivel 0)
    const ovaNode: MenuOption = {
      label: `OVA ${i + 1}: ${ova.titulo}`,
      icon: 'folder-open',
      route: null,
      roles: [1],
      nivel: 0,
      isOpen: false,
      children: ova.ciclos.map((ciclo: any) => ({
        id: ciclo.id,
        label: ciclo.titulo,
        icon: 'sync',
        route: null,
        roles: [1],
        nivel: 1,
        isOpen: false,
        children: ['Reflexion', 'Contextualizacion', 'Apropiacion', 'Transferencia'].map(fase => ({
          // 3. FASE/SECCIÓN (Nivel 2)
          label: fase,
          icon: (fase === 'Apropiacion' || fase === 'Transferencia') ? 'sparkles' : 'book',
          route: null,
          roles: [1],
          nivel: 2,
          accion: () => this.cicloSeleccionado.set({ ...ciclo, seccionActiva: fase })
        }))
      }))
    };
    menuDinamico.push(ovaNode);
  });

  this.currentMenuOptions.set(menuDinamico);
}
}