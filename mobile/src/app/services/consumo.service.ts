import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../core/config/api.config';
import { ResumenConsumoGeneros } from '../models/consumo-genero.model';

@Injectable({
  providedIn: 'root'
})
export class ConsumoService {
  private readonly http = inject(HttpClient);

  obtenerResumenGeneros(): Observable<ResumenConsumoGeneros> {
    return this.http.get<ResumenConsumoGeneros>(
      `${API_CONFIG.baseUrl}/consumo/generos`
    );
  }
}