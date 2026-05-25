import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ResumenConsumoGeneros } from '../models/consumo-genero.model';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class ConsumoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlService = inject(ApiUrlService);

  obtenerResumenGeneros(): Observable<ResumenConsumoGeneros> {
    return this.http.get<ResumenConsumoGeneros>(
      `${this.apiUrlService.obtenerBaseUrlRequerida()}/consumo/generos`
    );
  }
}