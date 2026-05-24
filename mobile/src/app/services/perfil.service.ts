import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../core/config/api.config';
import { ResumenActividadPerfiles } from '../models/actividad-perfil.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private readonly http = inject(HttpClient);

  obtenerActividadPerfiles(): Observable<ResumenActividadPerfiles> {
    return this.http.get<ResumenActividadPerfiles>(
      `${API_CONFIG.baseUrl}/perfiles/actividad`
    );
  }
}