import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { OpcionesFiltro } from '../models/filtros-kpi.model';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class FiltroService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlService = inject(ApiUrlService);

  obtenerOpcionesFiltros(): Observable<OpcionesFiltro> {
    return this.http.get<OpcionesFiltro>(
      `${this.apiUrlService.obtenerBaseUrlRequerida()}/filtros/opciones`
    );
  }
}