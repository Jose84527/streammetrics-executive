import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ResumenActividadPerfiles } from '../models/actividad-perfil.model';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlService = inject(ApiUrlService);

  obtenerActividadPerfiles(): Observable<ResumenActividadPerfiles> {
    return this.http.get<ResumenActividadPerfiles>(
      `${this.apiUrlService.obtenerBaseUrlRequerida()}/perfiles/actividad`
    );
  }
}