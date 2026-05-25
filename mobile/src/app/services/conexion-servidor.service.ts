import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { ResultadoConexionServidor } from '../models/configuracion-servidor.model';

@Injectable({
  providedIn: 'root'
})
export class ConexionServidorService {
  private readonly http = inject(HttpClient);

  probarConexion(ip: string, puerto: string): Observable<ResultadoConexionServidor> {
    const ipLimpia = ip.trim();
    const puertoLimpio = puerto.trim() || '8080';
    const url = `http://${ipLimpia}:${puertoLimpio}/api/salud`;

    return this.http.get(url).pipe(
      map(() => ({
        exitoso: true,
        mensaje: 'Conexión exitosa con el backend.'
      })),
      catchError(() =>
        of({
          exitoso: false,
          mensaje: 'No se pudo conectar con el backend. Verifica la IP, el puerto, la red Wi-Fi y el firewall.'
        })
      )
    );
  }
}