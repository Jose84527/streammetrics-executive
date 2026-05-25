import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ResumenDashboard } from '../models/resumen-dashboard.model';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlService = inject(ApiUrlService);

  obtenerResumen(): Observable<ResumenDashboard> {
    return this.http.get<ResumenDashboard>(
      `${this.apiUrlService.obtenerBaseUrlRequerida()}/dashboard/resumen`
    );
  }
}