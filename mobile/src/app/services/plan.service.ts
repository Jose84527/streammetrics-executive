import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ResumenPlanes } from '../models/plan-consumo.model';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlService = inject(ApiUrlService);

  obtenerConsumoPlanes(): Observable<ResumenPlanes> {
    return this.http.get<ResumenPlanes>(
      `${this.apiUrlService.obtenerBaseUrlRequerida()}/planes/consumo`
    );
  }
}