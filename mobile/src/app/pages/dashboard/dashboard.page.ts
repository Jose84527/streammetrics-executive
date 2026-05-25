import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';

import { ResumenDashboard } from '../../models/resumen-dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { InsightCardComponent } from '../../shared/components/insight-card/insight-card.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    SectionHeaderComponent,
    KpiCardComponent,
    InsightCardComponent,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonSpinner,
    IonText,
    IonList,
    IonItem,
    IonLabel,
    IonBadge
  ]
})
export class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  resumen = signal<ResumenDashboard | null>(null);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.dashboardService.obtenerResumen().subscribe({
      next: (respuesta) => {
        this.resumen.set(respuesta);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el resumen del dashboard.');
        this.cargando.set(false);
      }
    });
  }

  formatearNumero(valor: number): string {
    return this.formatoNumero.format(valor);
  }

  formatearDecimal(valor: number): string {
    return this.formatoDecimal.format(valor);
  }

  obtenerLecturaEjecutiva(): string {
    const datos = this.resumen();

    if (!datos) {
      return 'No hay información suficiente para generar una lectura ejecutiva.';
    }

    return `El análisis general muestra que ${datos.paisMayorConsumo} concentra el mayor consumo, el género ${datos.generoMasVisto} lidera la demanda y el plan ${datos.planMayorConsumo} presenta el mayor nivel de actividad. La franja ${datos.franjaHorariaMayorActividad} puede considerarse clave para campañas, estrenos o recomendaciones dentro de la plataforma.`;
  }
}