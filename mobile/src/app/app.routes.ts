import { Routes } from '@angular/router';

import { servidorConfiguradoGuard } from './guards/servidor-configurado.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'configuracion-servidor',
    loadComponent: () =>
      import('./pages/configuracion-servidor/configuracion-servidor.page').then(
        (m) => m.ConfiguracionServidorPage
      )
  },
  {
    path: 'dashboard',
    canActivate: [servidorConfiguradoGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage)
  },
  {
    path: 'consumo',
    canActivate: [servidorConfiguradoGuard],
    loadComponent: () =>
      import('./pages/consumo/consumo.page').then((m) => m.ConsumoPage)
  },
  {
    path: 'mercados',
    canActivate: [servidorConfiguradoGuard],
    loadComponent: () =>
      import('./pages/mercados/mercados.page').then((m) => m.MercadosPage)
  },
  {
    path: 'planes',
    canActivate: [servidorConfiguradoGuard],
    loadComponent: () =>
      import('./pages/planes/planes.page').then((m) => m.PlanesPage)
  },
  {
    path: 'metas',
    canActivate: [servidorConfiguradoGuard],
    loadComponent: () =>
      import('./pages/metas/metas.page').then((m) => m.MetasPage)
  },
  {
    path: 'perfiles',
    canActivate: [servidorConfiguradoGuard],
    loadComponent: () =>
      import('./pages/perfiles/perfiles.page').then((m) => m.PerfilesPage)
  },
  {
    path: 'contenidos',
    canActivate: [servidorConfiguradoGuard],
    loadComponent: () =>
      import('./pages/contenidos/contenidos.page').then((m) => m.ContenidosPage)
  },
  {
    path: 'reporte-ejecutivo',
    canActivate: [servidorConfiguradoGuard],
    loadComponent: () =>
      import('./pages/reporte-ejecutivo/reporte-ejecutivo.page').then(
        (m) => m.ReporteEjecutivoPage
      )
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];