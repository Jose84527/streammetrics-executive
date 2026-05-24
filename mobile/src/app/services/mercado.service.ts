import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../core/config/api.config';
import { ResumenMercados } from '../models/mercado-consumo.model';

@Injectable({
  providedIn: 'root'
})
export class MercadoService {
  private readonly http = inject(HttpClient);

  obtenerResumenMercados(): Observable<ResumenMercados> {
    return this.http.get<ResumenMercados>(
      `${API_CONFIG.baseUrl}/mercados/consumo`
    );
  }
}