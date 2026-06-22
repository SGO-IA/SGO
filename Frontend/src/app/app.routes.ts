import { Router, Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth-guard';
import { AuthCallback } from './pages/public/auth-callback/auth-callback';
import { DashboardLayout } from './shared/dashboard-layout/dashboard-layout';
import { LoginService } from './services/public/login-service';
import { inject } from '@angular/core';


export const routes: Routes = [
  // --- RUTAS PÚBLICAS (Sin Sidebar) ---
  {
    path: '',
    loadComponent: () => import('./pages/public/inicio/inicio').then(m => m.Inicio),
    title: 'S.G.O - Inicio'
  },
  {
    path: 'ayuda',
    loadComponent: () => import('./pages/public/ayuda/ayuda').then(m => m.Ayuda),
    title: 'S.G.O - Ayuda'
  },
  {
    path: 'privacidad',
    loadComponent: () => import('./pages/public/privacidad/privacidad').then(m => m.Privacidad),
    title: 'S.G.O - Privacidad'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/public/login/login').then(m => m.Login),
    title: 'S.G.O - Iniciar Sesión'
  },
  {
    path: 'auth-callback',
    component: AuthCallback
  },

  // --- RUTAS PRIVADAS (Con Sidebar y Layout Dinámico) ---
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [authGuard], // Protege todo el grupo
    children: [
      {
      path: '',
      redirectTo: 'router-roles', // Apuntamos a un "puente" interno
      pathMatch: 'full'
    },
      {
      path: 'router-roles',
        canActivate: [
          () => {
            const loginService = inject(LoginService);
            const router = inject(Router);
            const usuario = loginService.currentUser();

            if (usuario) {
              const vistaPorRol: Record<number, string> = {
                1: '/dashboard/aprendiz',
                2: '/dashboard/instructor',
                3: '/dashboard/panel',
                4: '/dashboard/semillas',
                5: '/dashboard/usuarios',
                6: '/dashboard/rector'
              };
              const rutaDestino = vistaPorRol[usuario.rol_id] || '/login';
              router.navigate([rutaDestino]);
              return false;
            }
            router.navigate(['/login']);
            return false;
          }
        ],
        loadComponent: () => import('@angular/core').then(m => m.Component)
      },
      // Admin (Rol 5)
      {
        path: 'importar',
        loadComponent: () => import('./pages/admin/importar/importar').then(m => m.Importar),
        title: 'S.G.O - Importar Excel',
        data: { roles: [5] }
      },
      {
        path: 'test',
        loadComponent: () => import('./pages/admin/test/test').then(m => m.Test),
        title: 'S.G.O - Test iniciales',
        data: { roles: [5] }
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/admin/usuarios/usuarios').then(m => m.Usuarios),
        title: 'S.G.O - Gestión de Usuarios',
        data: { roles: [5] }
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./pages/admin/configuracion/configuracion').then(m => m.Configuracion),
        title: 'S.G.O - Configuracion',
        data: { roles: [5] }
      },

      // Coordinador
      {
        path: 'coordinador',
        loadComponent: () => import('./pages/coordinador/coordinador/coordinador').then(m => m.Coordinador),
        title: 'S.G.O - Panel',
        data: { roles: [4] }
      },
      {
        path: 'expertos',
        loadComponent: () => import('./pages/coordinador/expertos/expertos').then(m => m.Expertos),
        title: 'S.G.O - Expertos tematicos',
        data: { roles: [4] }
      },
      {
        path: 'instructores',
        loadComponent: () => import('./pages/coordinador/instructores/instructores').then(m => m.Instructores),
        title: 'S.G.O - Instructores',
        data: { roles: [4] }
      },
      {
        path: 'semillas',
        loadComponent: () => import('./pages/coordinador/semillas/semillas').then(m => m.Semillas),
        title: 'S.G.O - Semillas',
        data: { roles: [4] }
      },

      // Experto tematico
      {
        path: 'panel',
        loadComponent: () => import('./pages/expertoTematico/experto-tematico/experto-tematico').then(m => m.ExpertoTematico),
        title: 'S.G.O - Panel',
        data: { roles: [3] }
      },
      {
      // 🚀 NUEVA RUTA: Captura el ID de la semilla seleccionada
      path: 'semilla/:id',
      loadComponent: () => import('./pages/expertoTematico/gestionar-semilla/gestionar-semilla').then(m => m.GestionarSemilla),
      title: 'S.G.O - Modulos de Semilla',
      data: { roles: [3] }
    },
    {
      path: 'semilla/:id/ciclo-didactico',
      loadComponent: () => import('./pages/expertoTematico/ciclo-didactico/ciclo-didactico').then(m => m.CicloDidactico),
      title: 'S.G.O - Ciclo Didáctico',
      data: { roles: [3] }
    },
    {
      path: 'semilla/:id/ciclo-didactico/editor',
      loadComponent: () => import('./pages/expertoTematico/confi-ciclo-didactico/confi-ciclo-didactico').then(m => m.ConfiCicloDidactico),
      title: 'S.G.O - Editor de Fase',
      data: { roles: [3] }
    },

    // Recto
    {
      path: 'rector',
      loadComponent: () => import('./pages/rector/rector').then(m => m.Rector),
      title: 'S.G.O - Rector',
      data: { roles: [6] }
    },
    { 
      path: 'rector/semilla/:id/ovas', 
      loadComponent: () => import('./components/rector/revisar-ovas/revisar-ovas').then(m => m.RevisionOvas),
      title: 'OVAS',
      data: { roles: [6] }
    },
    { 
      path: 'rector/ciclo/:id/lectura', 
      loadComponent: () => import('./components/rector/ciclo-lectura/ciclo-lectura').then(m => m.CicloLecturaComponent),
      title: 'Modo Lectura - Ciclo Didáctico',
      data: { roles: [6] }
    },
    { 
      path: 'aprendiz', 
      loadComponent: () => import('./pages/aprendiz/inicio/inicio').then(m => m.Inicio),
      title: 'Inicio',
      data: { roles: [1] }
    }
    ]
  },

  // --- MANEJO DE ERRORES ---
  {
    path: '**',
    redirectTo: 'login'
  }
];