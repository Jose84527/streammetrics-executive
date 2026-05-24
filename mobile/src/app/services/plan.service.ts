import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../core/config/api.config';
import { ResumenPlanes } from '../models/plan-consumo.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private readonly http = inject(HttpClient);

  obtenerConsumoPlanes(): Observable<ResumenPlanes> {
    return this.http.get<ResumenPlanes>(
      `${API_CONFIG.baseUrl}/planes/consumo`
    );
  }
}