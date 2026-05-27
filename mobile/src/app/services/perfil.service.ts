import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ResumenActividadPerfiles } from '../models/actividad-perfil.model';
import { FiltrosKpi } from '../models/filtros-kpi.model';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlService = inject(ApiUrlService);

  obtenerActividadPerfiles(filtros?: FiltrosKpi): Observable<ResumenActividadPerfiles> {
    return this.http.get<ResumenActividadPerfiles>(
      `${this.apiUrlService.obtenerBaseUrlRequerida()}/perfiles/actividad`,
      {
        params: this.construirParametros(filtros)
      }
    );
  }

  private construirParametros(filtros?: FiltrosKpi): HttpParams {
    let params = new HttpParams();

    if (!filtros) {
      return params;
    }

    if (filtros.anio) {
      params = params.set('anio', filtros.anio);
    }

    if (filtros.pais) {
      params = params.set('pais', filtros.pais);
    }

    if (filtros.continente) {
      params = params.set('continente', filtros.continente);
    }

    if (filtros.plan) {
      params = params.set('plan', filtros.plan);
    }

    if (filtros.nivelActividad) {
      params = params.set('nivelActividad', filtros.nivelActividad);
    }

    return params;
  }
}