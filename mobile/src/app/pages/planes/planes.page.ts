import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

import { ConsumoPlan, ResumenPlanes } from '../../models/plan-consumo.model';
import { PlanService } from '../../services/plan.service';
import { InsightCardComponent } from '../../shared/components/insight-card/insight-card.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';

type MetricaPlan = 'visualizaciones' | 'horasVistas';

@Component({
  selector: 'app-planes',
  templateUrl: './planes.page.html',
  styleUrls: ['./planes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    SectionHeaderComponent,
    KpiCardComponent,
    InsightCardComponent,
    BaseChartDirective,
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
    IonBadge,
    IonSegment,
    IonSegmentButton
  ]
})
export class PlanesPage implements OnInit {
  private readonly planService = inject(PlanService);

  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  resumen = signal<ResumenPlanes | null>(null);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);
  metricaGrafica = signal<MetricaPlan>('visualizaciones');

  readonly opcionesDona: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        enabled: true
      }
    }
  };

  readonly opcionesBarras: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };

  totalVisualizaciones = computed<number>(() => {
    return this.resumen()?.planes.reduce(
      (total, plan) => total + plan.visualizaciones,
      0
    ) ?? 0;
  });

  totalHorasVistas = computed<number>(() => {
    return this.resumen()?.planes.reduce(
      (total, plan) => total + plan.horasVistas,
      0
    ) ?? 0;
  });

  datosGraficaDona = computed<ChartData<'doughnut'>>(() => {
    const planes = this.resumen()?.planes ?? [];

    return {
      labels: planes.map((plan) => plan.nombre),
      datasets: [
        {
          data: planes.map((plan) => plan.visualizaciones)
        }
      ]
    };
  });

  datosGraficaBarras = computed<ChartData<'bar'>>(() => {
    const planes = this.resumen()?.planes ?? [];
    const metrica = this.metricaGrafica();
    const etiqueta = metrica === 'visualizaciones' ? 'Visualizaciones' : 'Horas vistas';

    return {
      labels: planes.map((plan) => plan.nombre),
      datasets: [
        {
          label: etiqueta,
          data: planes.map((plan) =>
            metrica === 'visualizaciones'
              ? plan.visualizaciones
              : plan.horasVistas
          )
        }
      ]
    };
  });

  ngOnInit(): void {
    this.cargarPlanes();
  }

  cargarPlanes(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.planService.obtenerConsumoPlanes().subscribe({
      next: (respuesta) => {
        this.resumen.set(respuesta);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el análisis de planes.');
        this.cargando.set(false);
      }
    });
  }

  obtenerPlanLider(): ConsumoPlan | null {
    return this.resumen()?.planes?.[0] ?? null;
  }

  actualizarMetrica(valor: string | number | undefined): void {
    if (valor === 'visualizaciones' || valor === 'horasVistas') {
      this.metricaGrafica.set(valor);
    }
  }

  formatearNumero(valor: number): string {
    return this.formatoNumero.format(valor);
  }

  formatearDecimal(valor: number): string {
    return this.formatoDecimal.format(valor);
  }

  obtenerPorcentajeVisualizaciones(plan: ConsumoPlan): string {
    const total = this.totalVisualizaciones();

    if (total === 0) {
      return '0.00';
    }

    return this.formatearDecimal((plan.visualizaciones / total) * 100);
  }

  obtenerPorcentajeBarra(plan: ConsumoPlan): number {
    const planLider = this.obtenerPlanLider();

    if (!planLider || planLider.visualizaciones === 0) {
      return 0;
    }

    return (plan.visualizaciones / planLider.visualizaciones) * 100;
  }

  obtenerLecturaEjecutiva(): string {
    const planLider = this.obtenerPlanLider();

    if (!planLider) {
      return 'No hay información suficiente para generar una lectura ejecutiva de planes.';
    }

    return `El plan ${planLider.nombre} concentra el mayor consumo registrado. Esto permite analizar si la estrategia de suscripción está alineada con los hábitos de visualización y si conviene reforzar promociones, beneficios o recomendaciones para otros planes.`;
  }
}