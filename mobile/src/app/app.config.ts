import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withPreloading
} from '@angular/router';

import {
  IonicRouteStrategy,
  provideIonicAngular
} from '@ionic/angular/standalone';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    provideIonicAngular(),
    provideHttpClient(),
    provideCharts(withDefaultRegisterables()),
    provideRouter(routes, withPreloading(PreloadAllModules))
  ]
};