import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ResumenMercados } from '../models/mercado-consumo.model';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class MercadoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlService = inject(ApiUrlService);

  obtenerResumenMercados(): Observable<ResumenMercados> {
    return this.http.get<ResumenMercados>(
      `${this.apiUrlService.obtenerBaseUrlRequerida()}/mercados/consumo`
    );
  }
}