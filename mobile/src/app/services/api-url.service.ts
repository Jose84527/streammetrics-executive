import { Injectable } from '@angular/core';

import { ConfiguracionServidor } from '../models/configuracion-servidor.model';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlService {
  private readonly storageKey = 'streammetrics_api_config';

  obtenerConfiguracion(): ConfiguracionServidor | null {
    const valorGuardado = localStorage.getItem(this.storageKey);

    if (!valorGuardado) {
      return null;
    }

    try {
      return JSON.parse(valorGuardado) as ConfiguracionServidor;
    } catch {
      this.eliminarConfiguracion();
      return null;
    }
  }

  obtenerBaseUrl(): string | null {
    return this.obtenerConfiguracion()?.baseUrl ?? null;
  }

  obtenerBaseUrlRequerida(): string {
    const baseUrl = this.obtenerBaseUrl();

    if (!baseUrl) {
      throw new Error('No hay servidor configurado para consumir la API.');
    }

    return baseUrl;
  }

  guardarConfiguracion(ip: string, puerto: string): ConfiguracionServidor {
    const ipLimpia = ip.trim();
    const puertoLimpio = puerto.trim() || '8080';

    const configuracion: ConfiguracionServidor = {
      ip: ipLimpia,
      puerto: puertoLimpio,
      baseUrl: `http://${ipLimpia}:${puertoLimpio}/api`
    };

    localStorage.setItem(this.storageKey, JSON.stringify(configuracion));

    return configuracion;
  }

  eliminarConfiguracion(): void {
    localStorage.removeItem(this.storageKey);
  }

  existeConfiguracion(): boolean {
    return this.obtenerConfiguracion() !== null;
  }
}