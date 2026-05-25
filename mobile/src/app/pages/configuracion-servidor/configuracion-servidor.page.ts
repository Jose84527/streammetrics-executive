import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';

import { ApiUrlService } from '../../services/api-url.service';
import { ConexionServidorService } from '../../services/conexion-servidor.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';

@Component({
  selector: 'app-configuracion-servidor',
  templateUrl: './configuracion-servidor.page.html',
  styleUrls: ['./configuracion-servidor.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    SectionHeaderComponent,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSpinner,
    IonText
  ]
})
export class ConfiguracionServidorPage implements OnInit {
  private readonly apiUrlService = inject(ApiUrlService);
  private readonly conexionServidorService = inject(ConexionServidorService);
  private readonly router = inject(Router);

  ip = signal<string>('');
  puerto = signal<string>('8080');

  probando = signal<boolean>(false);
  conexionExitosa = signal<boolean>(false);
  mensaje = signal<string | null>(null);

  ngOnInit(): void {
    const configuracion = this.apiUrlService.obtenerConfiguracion();

    if (configuracion) {
      this.ip.set(configuracion.ip);
      this.puerto.set(configuracion.puerto);
      this.conexionExitosa.set(true);
      this.mensaje.set(`Servidor configurado actualmente: ${configuracion.baseUrl}`);
    }
  }

  actualizarIp(valor: string | number | null | undefined): void {
    this.ip.set(String(valor ?? ''));
    this.conexionExitosa.set(false);
  }

  actualizarPuerto(valor: string | number | null | undefined): void {
    this.puerto.set(String(valor ?? '8080'));
    this.conexionExitosa.set(false);
  }

  probarConexion(): void {
    if (!this.ip().trim()) {
      this.mensaje.set('Ingresa la IP de tu laptop antes de probar la conexión.');
      this.conexionExitosa.set(false);
      return;
    }

    this.probando.set(true);
    this.mensaje.set(null);

    this.conexionServidorService.probarConexion(this.ip(), this.puerto()).subscribe({
      next: (resultado) => {
        this.conexionExitosa.set(resultado.exitoso);
        this.mensaje.set(resultado.mensaje);
        this.probando.set(false);
      }
    });
  }

  guardarYContinuar(): void {
    if (!this.conexionExitosa()) {
      this.mensaje.set('Primero prueba la conexión correctamente antes de continuar.');
      return;
    }

    this.apiUrlService.guardarConfiguracion(this.ip(), this.puerto());
    this.router.navigateByUrl('/dashboard');
  }

  limpiarConfiguracion(): void {
    this.apiUrlService.eliminarConfiguracion();
    this.ip.set('');
    this.puerto.set('8080');
    this.conexionExitosa.set(false);
    this.mensaje.set('Configuración eliminada. Ingresa una nueva IP para continuar.');
  }
}