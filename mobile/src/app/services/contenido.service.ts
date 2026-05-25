import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../core/config/api.config';
import { ResumenDesempenoContenidos } from '../models/desempeno-contenido.model';

@Injectable({
  providedIn: 'root'
})
export class ContenidoService {
  private readonly http = inject(HttpClient);

  obtenerDesempenoContenidos(): Observable<ResumenDesempenoContenidos> {
    return this.http.get<ResumenDesempenoContenidos>(
      `${API_CONFIG.baseUrl}/contenidos/desempeno`
    );
  }
}