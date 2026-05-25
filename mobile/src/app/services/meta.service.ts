import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ResumenCumplimientoMetas } from '../models/cumplimiento-meta.model';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlService = inject(ApiUrlService);

  obtenerCumplimientoMetas(): Observable<ResumenCumplimientoMetas> {
    return this.http.get<ResumenCumplimientoMetas>(
      `${this.apiUrlService.obtenerBaseUrlRequerida()}/metas/cumplimiento`
    );
  }
}