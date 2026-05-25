import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ResumenReporteEjecutivo } from '../models/reporte-ejecutivo.model';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteEjecutivoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlService = inject(ApiUrlService);

  obtenerResumenReporte(): Observable<ResumenReporteEjecutivo> {
    return this.http.get<ResumenReporteEjecutivo>(
      `${this.apiUrlService.obtenerBaseUrlRequerida()}/reporte-ejecutivo/resumen`
    );
  }
}