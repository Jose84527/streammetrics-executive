import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ResumenConsumoGeneros } from '../models/consumo-genero.model';
import { FiltrosKpi } from '../models/filtros-kpi.model';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class ConsumoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlService = inject(ApiUrlService);

  obtenerResumenGeneros(filtros?: FiltrosKpi): Observable<ResumenConsumoGeneros> {
    return this.http.get<ResumenConsumoGeneros>(
      `${this.apiUrlService.obtenerBaseUrlRequerida()}/consumo/generos`,
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

    if (filtros.tipoContenido) {
      params = params.set('tipoContenido', filtros.tipoContenido);
    }

    return params;
  }
}