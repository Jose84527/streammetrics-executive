import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
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

import {
  ItemEjecutivo,
  ResumenReporteEjecutivo
} from '../../models/reporte-ejecutivo.model';
import { ReporteEjecutivoService } from '../../services/reporte-ejecutivo.service';
import { ReportePdfService } from '../../services/reporte-pdf.service';
import { InsightCardComponent } from '../../shared/components/insight-card/insight-card.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';

@Component({
  selector: 'app-reporte-ejecutivo',
  templateUrl: './reporte-ejecutivo.page.html',
  styleUrls: ['./reporte-ejecutivo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
export class ReporteEjecutivoPage implements OnInit {
  private readonly reporteEjecutivoService = inject(ReporteEjecutivoService);
  private readonly reportePdfService = inject(ReportePdfService);

  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  reporte = signal<ResumenReporteEjecutivo | null>(null);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.reporteEjecutivoService.obtenerResumenReporte().subscribe({
      next: (respuesta) => {
        this.reporte.set(respuesta);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el reporte ejecutivo.');
        this.cargando.set(false);
      }
    });
  }

  generarPdf(): void {
    const datos = this.reporte();

    if (!datos) {
      this.error.set('No hay datos disponibles para generar el PDF.');
      return;
    }

    this.reportePdfService.generarReporteEjecutivo(datos);
  }

  formatearNumero(valor: number): string {
    return this.formatoNumero.format(valor);
  }

  formatearDecimal(valor: number): string {
    return this.formatoDecimal.format(valor);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(fecha));
  }

  obtenerColorNivel(nivel: string): string {
    const nivelNormalizado = this.normalizarTexto(nivel);

    if (nivelNormalizado.includes('alto') || nivelNormalizado.includes('alta')) {
      return 'danger';
    }

    if (nivelNormalizado.includes('medio') || nivelNormalizado.includes('media')) {
      return 'warning';
    }

    if (nivelNormalizado.includes('positivo') || nivelNormalizado.includes('bueno')) {
      return 'success';
    }

    return 'primary';
  }

  obtenerNivelLegible(nivel: string): string {
    if (!nivel) {
      return 'INFO';
    }

    return nivel.replace('_', ' ');
  }

  obtenerConclusionEjecutiva(): string {
    const datos = this.reporte();

    if (!datos) {
      return 'No hay información suficiente para generar una conclusión ejecutiva.';
    }

    return `El análisis muestra que ${datos.resumenGeneral.paisMayorConsumo} concentra el mayor consumo, el género ${datos.resumenGeneral.generoMasVisto} lidera la demanda y el plan ${datos.resumenGeneral.planMayorConsumo} presenta el mayor nivel de actividad. Con base en los hallazgos, se recomienda priorizar campañas, recomendaciones y acciones de retención en los segmentos con mayor oportunidad estratégica.`;
  }

  hayElementos(lista: ItemEjecutivo[]): boolean {
    return Array.isArray(lista) && lista.length > 0;
  }

  private normalizarTexto(texto: string): string {
    return (texto ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}