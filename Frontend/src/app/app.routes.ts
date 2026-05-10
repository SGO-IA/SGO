import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth-guard';
import { AuthCallback } from './pages/public/auth-callback/auth-callback';
import { DashboardLayout } from './shared/dashboard-layout/dashboard-layout';


export const routes: Routes = [
  // --- RUTAS PÚBLICAS (Sin Sidebar) ---
  {
    path: '',
    loadComponent: () => import('./pages/public/inicio/inicio').then(m => m.Inicio),
    title: 'S.G.O - Inicio'
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
    ]
  },

  // --- MANEJO DE ERRORES ---
  {
    path: '**',
    redirectTo: 'login'
  }
];