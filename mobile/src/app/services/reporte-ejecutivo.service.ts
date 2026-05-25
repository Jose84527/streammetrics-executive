import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../core/config/api.config';
import { ResumenReporteEjecutivo } from '../models/reporte-ejecutivo.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteEjecutivoService {
  private readonly http = inject(HttpClient);

  obtenerResumenReporte(): Observable<ResumenReporteEjecutivo> {
    return this.http.get<ResumenReporteEjecutivo>(
      `${API_CONFIG.baseUrl}/reporte-ejecutivo/resumen`
    );
  }
}