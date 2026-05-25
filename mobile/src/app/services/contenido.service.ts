import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ResumenDesempenoContenidos } from '../models/desempeno-contenido.model';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class ContenidoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlService = inject(ApiUrlService);

  obtenerDesempenoContenidos(): Observable<ResumenDesempenoContenidos> {
    return this.http.get<ResumenDesempenoContenidos>(
      `${this.apiUrlService.obtenerBaseUrlRequerida()}/contenidos/desempeno`
    );
  }
}