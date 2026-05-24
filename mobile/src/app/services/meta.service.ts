import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../core/config/api.config';
import { ResumenCumplimientoMetas } from '../models/cumplimiento-meta.model';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private readonly http = inject(HttpClient);

  obtenerCumplimientoMetas(): Observable<ResumenCumplimientoMetas> {
    return this.http.get<ResumenCumplimientoMetas>(
      `${API_CONFIG.baseUrl}/metas/cumplimiento`
    );
  }
}