import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ApiUrlService } from '../services/api-url.service';

export const servidorConfiguradoGuard: CanActivateFn = () => {
  const apiUrlService = inject(ApiUrlService);
  const router = inject(Router);

  if (apiUrlService.existeConfiguracion()) {
    return true;
  }

  return router.createUrlTree(['/configuracion-servidor']);
};