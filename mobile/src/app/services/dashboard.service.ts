import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../core/config/api.config';
import { ResumenDashboard } from '../models/resumen-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  obtenerResumen(): Observable<ResumenDashboard> {
    return this.http.get<ResumenDashboard>(`${API_CONFIG.baseUrl}/dashboard/resumen`);
  }
}