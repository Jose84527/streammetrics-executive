import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage)
  },
  {
    path: 'consumo',
    loadComponent: () =>
      import('./pages/consumo/consumo.page').then((m) => m.ConsumoPage)
  },
  {
    path: 'mercados',
    loadComponent: () =>
      import('./pages/mercados/mercados.page').then((m) => m.MercadosPage)
  },
  {
    path: 'planes',
    loadComponent: () =>
      import('./pages/planes/planes.page').then((m) => m.PlanesPage)
  },
  {
    path: 'metas',
    loadComponent: () =>
      import('./pages/metas/metas.page').then((m) => m.MetasPage)
  },
  {
    path: 'perfiles',
    loadComponent: () =>
      import('./pages/perfiles/perfiles.page').then((m) => m.PerfilesPage)
  },
  {
    path: 'contenidos',
    loadComponent: () =>
      import('./pages/contenidos/contenidos.page').then((m) => m.ContenidosPage)
  },
  {
    path: 'reporte-ejecutivo',
    loadComponent: () =>
      import('./pages/reporte-ejecutivo/reporte-ejecutivo.page').then(
        (m) => m.ReporteEjecutivoPage
      )
  }
];