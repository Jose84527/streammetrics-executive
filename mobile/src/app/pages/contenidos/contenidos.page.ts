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

import {
  DesempenoContenido,
  ResumenDesempenoContenidos
} from '../../models/desempeno-contenido.model';
import { ContenidoService } from '../../services/contenido.service';
import { InsightCardComponent } from '../../shared/components/insight-card/insight-card.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';

type MetricaContenido =
  | 'visualizaciones'
  | 'horasVistas'
  | 'calificacionPromedio'
  | 'tasaFinalizacion';

@Component({
  selector: 'app-contenidos',
  templateUrl: './contenidos.page.html',
  styleUrls: ['./contenidos.page.scss'],
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
export class ContenidosPage implements OnInit {
  private readonly contenidoService = inject(ContenidoService);

  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  resumen = signal<ResumenDesempenoContenidos | null>(null);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  metricaGrafica = signal<MetricaContenido>('visualizaciones');

  readonly opcionesBarras: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
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
        beginAtZero: true
      },
      y: {
        ticks: {
          autoSkip: false
        }
      }
    }
  };

  readonly opcionesBarrasComparativas: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      x: {
        beginAtZero: true
      },
      y: {
        ticks: {
          autoSkip: false
        }
      }
    }
  };

  contenidosUnicos = computed<DesempenoContenido[]>(() => {
    const datos = this.resumen();

    if (!datos) {
      return [];
    }

    return this.obtenerContenidosUnicos(datos);
  });

  contenidosGraficaPrincipal = computed<DesempenoContenido[]>(() => {
    const metrica = this.metricaGrafica();

    return [...this.contenidosUnicos()]
      .sort((a, b) => this.obtenerValorMetrica(b, metrica) - this.obtenerValorMetrica(a, metrica))
      .slice(0, 5);
  });

  datosGraficaPrincipal = computed<ChartData<'bar'>>(() => {
    const contenidos = this.contenidosGraficaPrincipal();
    const metrica = this.metricaGrafica();

    return {
      labels: contenidos.map((contenido) => this.recortarTitulo(contenido.titulo)),
      datasets: [
        {
          label: this.obtenerEtiquetaMetrica(metrica),
          data: contenidos.map((contenido) => this.obtenerValorMetrica(contenido, metrica))
        }
      ]
    };
  });

  datosGraficaCalidad = computed<ChartData<'bar'>>(() => {
    const contenidos = [...this.contenidosUnicos()]
      .sort((a, b) => b.tasaFinalizacion - a.tasaFinalizacion)
      .slice(0, 5);

    return {
      labels: contenidos.map((contenido) => this.recortarTitulo(contenido.titulo)),
      datasets: [
        {
          label: 'Calificación promedio',
          data: contenidos.map((contenido) => contenido.calificacionPromedio)
        },
        {
          label: 'Finalización / 20',
          data: contenidos.map((contenido) => contenido.tasaFinalizacion / 20)
        }
      ]
    };
  });

  ngOnInit(): void {
    this.cargarContenidos();
  }

  cargarContenidos(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.contenidoService.obtenerDesempenoContenidos().subscribe({
      next: (respuesta) => {
        this.resumen.set(respuesta);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el desempeño de contenidos.');
        this.cargando.set(false);
      }
    });
  }

  obtenerContenidoMasVisto(): DesempenoContenido | null {
    return this.resumen()?.contenidosMasVistos?.[0] ?? null;
  }

  obtenerContenidoMejorCalificado(): DesempenoContenido | null {
    return this.resumen()?.contenidosMejorCalificados?.[0] ?? null;
  }

  obtenerContenidoMayorFinalizacion(): DesempenoContenido | null {
    return this.resumen()?.contenidosMayorFinalizacion?.[0] ?? null;
  }

  actualizarMetrica(valor: string | number | undefined): void {
    if (
      valor === 'visualizaciones' ||
      valor === 'horasVistas' ||
      valor === 'calificacionPromedio' ||
      valor === 'tasaFinalizacion'
    ) {
      this.metricaGrafica.set(valor);
    }
  }

  formatearNumero(valor: number): string {
    return this.formatoNumero.format(valor);
  }

  formatearDecimal(valor: number): string {
    return this.formatoDecimal.format(valor);
  }

  obtenerPorcentajeBarraVisualizaciones(contenido: DesempenoContenido): number {
    const lider = this.obtenerContenidoMasVisto();

    if (!lider || lider.visualizaciones === 0) {
      return 0;
    }

    return (contenido.visualizaciones / lider.visualizaciones) * 100;
  }

  obtenerPorcentajeBarraCalificacion(contenido: DesempenoContenido): number {
    const maximo = 5;

    if (contenido.calificacionPromedio <= 0) {
      return 2;
    }

    return Math.min((contenido.calificacionPromedio / maximo) * 100, 100);
  }

  obtenerPorcentajeBarraFinalizacion(contenido: DesempenoContenido): number {
    if (contenido.tasaFinalizacion <= 0) {
      return 2;
    }

    return Math.min(contenido.tasaFinalizacion, 100);
  }

  obtenerLecturaEjecutiva(): string {
    const masVisto = this.obtenerContenidoMasVisto();
    const mejorCalificado = this.obtenerContenidoMejorCalificado();
    const mayorFinalizacion = this.obtenerContenidoMayorFinalizacion();

    if (!masVisto || !mejorCalificado || !mayorFinalizacion) {
      return 'No hay información suficiente para generar una lectura ejecutiva de contenidos.';
    }

    return `El contenido con mayor alcance es "${masVisto.titulo}", mientras que "${mejorCalificado.titulo}" destaca por calificación promedio y "${mayorFinalizacion.titulo}" por tasa de finalización. Esta comparación ayuda a distinguir entre popularidad, satisfacción y retención de audiencia.`;
  }

  obtenerEtiquetaMetrica(metrica: MetricaContenido): string {
    if (metrica === 'visualizaciones') {
      return 'Visualizaciones';
    }

    if (metrica === 'horasVistas') {
      return 'Horas vistas';
    }

    if (metrica === 'calificacionPromedio') {
      return 'Calificación promedio';
    }

    return 'Tasa de finalización';
  }

  private obtenerValorMetrica(
    contenido: DesempenoContenido,
    metrica: MetricaContenido
  ): number {
    if (metrica === 'visualizaciones') {
      return contenido.visualizaciones;
    }

    if (metrica === 'horasVistas') {
      return contenido.horasVistas;
    }

    if (metrica === 'calificacionPromedio') {
      return contenido.calificacionPromedio;
    }

    return contenido.tasaFinalizacion;
  }

  private obtenerContenidosUnicos(
    datos: ResumenDesempenoContenidos
  ): DesempenoContenido[] {
    const mapa = new Map<string, DesempenoContenido>();

    const agregarContenido = (contenido: DesempenoContenido) => {
      const llave = `${contenido.titulo}-${contenido.tipoContenido}`;

      if (!mapa.has(llave)) {
        mapa.set(llave, contenido);
      }
    };

    datos.contenidosMasVistos.forEach(agregarContenido);
    datos.contenidosMejorCalificados.forEach(agregarContenido);
    datos.contenidosMayorFinalizacion.forEach(agregarContenido);

    return Array.from(mapa.values());
  }

  private recortarTitulo(titulo: string): string {
    if (titulo.length <= 24) {
      return titulo;
    }

    return `${titulo.slice(0, 24)}...`;
  }
}