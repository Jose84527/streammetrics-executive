import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FiltrosKpi } from '../models/filtros-kpi.model';
import { ResumenPlanes } from '../models/plan-consumo.model';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlService = inject(ApiUrlService);

  obtenerConsumoPlanes(filtros?: FiltrosKpi): Observable<ResumenPlanes> {
    return this.http.get<ResumenPlanes>(
      `${this.apiUrlService.obtenerBaseUrlRequerida()}/planes/consumo`,
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

    if (filtros.tipoContenido) {
      params = params.set('tipoContenido', filtros.tipoContenido);
    }

    if (filtros.genero) {
      params = params.set('genero', filtros.genero);
    }

    return params;
  }
}