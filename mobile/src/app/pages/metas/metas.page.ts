import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

import {
  CumplimientoMeta,
  EstadoCumplimiento,
  ResumenCumplimientoMetas
} from '../../models/cumplimiento-meta.model';
import { MetaService } from '../../services/meta.service';
import { InsightCardComponent } from '../../shared/components/insight-card/insight-card.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';

type MetricaMeta = 'visualizaciones' | 'horas';

@Component({
  selector: 'app-metas',
  templateUrl: './metas.page.html',
  styleUrls: ['./metas.page.scss'],
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
    IonChip,
    IonSelect,
    IonSelectOption,
    IonSegment,
    IonSegmentButton
  ]
})
export class MetasPage implements OnInit {
  private readonly metaService = inject(MetaService);

  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  resumen = signal<ResumenCumplimientoMetas | null>(null);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  paisesSeleccionados = signal<string[]>([]);
  metricaGrafica = signal<MetricaMeta>('visualizaciones');

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

  paisesOrdenadosPorCumplimiento = computed<CumplimientoMeta[]>(() => {
    return [...(this.resumen()?.cumplimientoPorPais ?? [])].sort(
      (a, b) =>
        a.porcentajeCumplimientoVisualizaciones -
        b.porcentajeCumplimientoVisualizaciones
    );
  });

  topPaisesCriticos = computed<CumplimientoMeta[]>(() => {
    return this.paisesOrdenadosPorCumplimiento().slice(0, 5);
  });

  mercadosAlto = computed<number>(() => this.contarPorEstado('ALTO'));
  mercadosMedio = computed<number>(() => this.contarPorEstado('MEDIO'));
  mercadosBajo = computed<number>(() => this.contarPorEstado('BAJO'));
  mercadosSinMeta = computed<number>(() => this.contarPorEstado('SIN_META'));

  datosGraficaEstados = computed<ChartData<'doughnut'>>(() => {
    return {
      labels: ['Alto', 'Medio', 'Bajo', 'Sin meta'],
      datasets: [
        {
          data: [
            this.mercadosAlto(),
            this.mercadosMedio(),
            this.mercadosBajo(),
            this.mercadosSinMeta()
          ]
        }
      ]
    };
  });

  datosGraficaComparativa = computed<ChartData<'bar'>>(() => {
    const datos = this.resumen();

    if (!datos) {
      return {
        labels: [],
        datasets: []
      };
    }

    const paises = this.obtenerPaisesParaComparacion(datos);
    const metrica = this.metricaGrafica();

    if (metrica === 'visualizaciones') {
      return {
        labels: paises.map((pais) => pais.pais),
        datasets: [
          {
            label: 'Visualizaciones reales',
            data: paises.map((pais) => pais.visualizacionesReales)
          },
          {
            label: 'Meta visualizaciones',
            data: paises.map((pais) => pais.metaVisualizaciones)
          }
        ]
      };
    }

    return {
      labels: paises.map((pais) => pais.pais),
      datasets: [
        {
          label: 'Horas reales',
          data: paises.map((pais) => pais.horasReales)
        },
        {
          label: 'Meta horas',
          data: paises.map((pais) => pais.metaHoras)
        }
      ]
    };
  });

  ngOnInit(): void {
    this.cargarMetas();
  }

  cargarMetas(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.metaService.obtenerCumplimientoMetas().subscribe({
      next: (respuesta) => {
        this.resumen.set(respuesta);
        this.establecerSeleccionInicial(respuesta);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el cumplimiento de metas.');
        this.cargando.set(false);
      }
    });
  }

  obtenerMercadoCritico(): CumplimientoMeta | null {
    return this.paisesOrdenadosPorCumplimiento()[0] ?? null;
  }

  obtenerMejorMercado(): CumplimientoMeta | null {
    const paises = this.paisesOrdenadosPorCumplimiento();

    if (paises.length === 0) {
      return null;
    }

    return paises[paises.length - 1];
  }

  actualizarSeleccionPaises(valor: string[] | string | null | undefined): void {
    if (Array.isArray(valor)) {
      this.paisesSeleccionados.set(valor);
      return;
    }

    if (typeof valor === 'string') {
      this.paisesSeleccionados.set([valor]);
      return;
    }

    this.paisesSeleccionados.set([]);
  }

  actualizarMetrica(valor: string | number | undefined): void {
    if (valor === 'visualizaciones' || valor === 'horas') {
      this.metricaGrafica.set(valor);
    }
  }

  restablecerMercadosCriticos(): void {
    this.paisesSeleccionados.set(
      this.topPaisesCriticos().map((pais) => pais.pais)
    );
  }

  formatearNumero(valor: number): string {
    return this.formatoNumero.format(valor);
  }

  formatearDecimal(valor: number): string {
    return this.formatoDecimal.format(valor);
  }

  obtenerColorEstado(estado: EstadoCumplimiento): string {
    if (estado === 'ALTO') {
      return 'success';
    }

    if (estado === 'MEDIO') {
      return 'warning';
    }

    if (estado === 'BAJO') {
      return 'danger';
    }

    return 'medium';
  }

  obtenerVarianteEstado(estado: EstadoCumplimiento): 'normal' | 'positivo' | 'advertencia' | 'riesgo' {
    if (estado === 'ALTO') {
      return 'positivo';
    }

    if (estado === 'MEDIO') {
      return 'advertencia';
    }

    if (estado === 'BAJO') {
      return 'riesgo';
    }

    return 'normal';
  }

  obtenerPorcentajeBarra(pais: CumplimientoMeta): number {
    const porcentaje = pais.porcentajeCumplimientoVisualizaciones;

    if (porcentaje <= 0) {
      return 2;
    }

    return Math.min(porcentaje, 100);
  }

  obtenerLecturaEjecutiva(): string {
    const mercadoCritico = this.obtenerMercadoCritico();
    const mejorMercado = this.obtenerMejorMercado();

    if (!mercadoCritico || !mejorMercado) {
      return 'No hay información suficiente para generar una lectura ejecutiva de metas.';
    }

    return `El mercado con mayor brecha frente a metas es ${mercadoCritico.pais}, con ${this.formatearDecimal(mercadoCritico.porcentajeCumplimientoVisualizaciones)}% de cumplimiento en visualizaciones. Por otro lado, ${mejorMercado.pais} muestra el mejor desempeño relativo. Esto permite priorizar acciones comerciales en mercados con bajo cumplimiento.`;
  }

  private establecerSeleccionInicial(respuesta: ResumenCumplimientoMetas): void {
    const paisesCriticos = [...respuesta.cumplimientoPorPais]
      .sort(
        (a, b) =>
          a.porcentajeCumplimientoVisualizaciones -
          b.porcentajeCumplimientoVisualizaciones
      )
      .slice(0, 5)
      .map((pais) => pais.pais);

    this.paisesSeleccionados.set(paisesCriticos);
  }

  private obtenerPaisesParaComparacion(datos: ResumenCumplimientoMetas): CumplimientoMeta[] {
    const seleccionados = this.paisesSeleccionados();

    if (seleccionados.length === 0) {
      return this.topPaisesCriticos();
    }

    return datos.cumplimientoPorPais.filter((pais) =>
      seleccionados.includes(pais.pais)
    );
  }

  private contarPorEstado(estado: EstadoCumplimiento): number {
    return this.resumen()?.cumplimientoPorPais.filter(
      (pais) => pais.estado === estado
    ).length ?? 0;
  }
}