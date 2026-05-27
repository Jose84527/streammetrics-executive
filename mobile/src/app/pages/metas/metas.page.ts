import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  IonAccordion,
  IonAccordionGroup,
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
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

import { CumplimientoMeta, ResumenCumplimientoMetas } from '../../models/cumplimiento-meta.model';
import { FiltrosKpi, OpcionesFiltro } from '../../models/filtros-kpi.model';
import { FiltroService } from '../../services/filtro.service';
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
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonAccordion,
    IonAccordionGroup
  ]
})
export class MetasPage implements OnInit {
  private readonly metaService = inject(MetaService);
  private readonly filtroService = inject(FiltroService);

  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  resumen = signal<ResumenCumplimientoMetas | null>(null);
  opcionesFiltro = signal<OpcionesFiltro | null>(null);

  cargando = signal<boolean>(false);
  cargandoFiltros = signal<boolean>(false);
  error = signal<string | null>(null);

  metricaGrafica = signal<MetricaMeta>('visualizaciones');

  anioSeleccionado = signal<number | null>(null);
  paisSeleccionado = signal<string | null>(null);
  continenteSeleccionado = signal<string | null>(null);
  planSeleccionado = signal<string | null>(null);
  tipoContenidoSeleccionado = signal<string | null>(null);
  prioridadMercadoSeleccionada = signal<string | null>(null);

  filtrosAplicados = signal<FiltrosKpi>({});

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
        display: false
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 130
      },
      y: {
        ticks: {
          autoSkip: false
        }
      }
    }
  };

  cumplimiento = computed<CumplimientoMeta[]>(() => {
    return this.resumen()?.cumplimientoPorPais ?? [];
  });

  mercadosCriticos = computed<CumplimientoMeta[]>(() => {
    return this.cumplimiento().slice(0, 5);
  });

  mercadosGrafica = computed<CumplimientoMeta[]>(() => {
    return this.cumplimiento().slice(0, 10);
  });

  totalVisualizacionesReales = computed<number>(() => {
    return this.cumplimiento().reduce(
      (total, item) => total + item.visualizacionesReales,
      0
    );
  });

  totalMetaVisualizaciones = computed<number>(() => {
    return this.cumplimiento().reduce(
      (total, item) => total + item.metaVisualizaciones,
      0
    );
  });

  totalHorasReales = computed<number>(() => {
    return this.cumplimiento().reduce(
      (total, item) => total + item.horasReales,
      0
    );
  });

  totalMetaHoras = computed<number>(() => {
    return this.cumplimiento().reduce(
      (total, item) => total + item.metaHoras,
      0
    );
  });

  cumplimientoGlobalVisualizaciones = computed<number>(() => {
    const meta = this.totalMetaVisualizaciones();

    if (meta === 0) {
      return 0;
    }

    return (this.totalVisualizacionesReales() / meta) * 100;
  });

  cumplimientoGlobalHoras = computed<number>(() => {
    const meta = this.totalMetaHoras();

    if (meta === 0) {
      return 0;
    }

    return (this.totalHorasReales() / meta) * 100;
  });

  datosGraficaEstados = computed<ChartData<'doughnut'>>(() => {
    const conteo = new Map<string, number>();

    for (const item of this.cumplimiento()) {
      const estado = item.estado || 'SIN_ESTADO';
      conteo.set(estado, (conteo.get(estado) ?? 0) + 1);
    }

    return {
      labels: Array.from(conteo.keys()),
      datasets: [
        {
          data: Array.from(conteo.values())
        }
      ]
    };
  });

  datosGraficaCumplimiento = computed<ChartData<'bar'>>(() => {
    const metrica = this.metricaGrafica();
    const datos = this.mercadosGrafica();

    return {
      labels: datos.map((item) => item.pais),
      datasets: [
        {
          label: metrica === 'visualizaciones'
            ? 'Cumplimiento visualizaciones'
            : 'Cumplimiento horas',
          data: datos.map((item) =>
            metrica === 'visualizaciones'
              ? item.porcentajeCumplimientoVisualizaciones
              : item.porcentajeCumplimientoHoras
          )
        }
      ]
    };
  });

  ngOnInit(): void {
    this.cargarOpcionesFiltros();
    this.cargarMetas();
  }

  cargarOpcionesFiltros(): void {
    this.cargandoFiltros.set(true);

    this.filtroService.obtenerOpcionesFiltros().subscribe({
      next: (respuesta) => {
        this.opcionesFiltro.set(respuesta);
        this.cargandoFiltros.set(false);
      },
      error: () => {
        this.cargandoFiltros.set(false);
      }
    });
  }

  cargarMetas(filtros: FiltrosKpi = this.filtrosAplicados()): void {
    this.cargando.set(true);
    this.error.set(null);

    this.metaService.obtenerCumplimientoMetas(filtros).subscribe({
      next: (respuesta) => {
        this.resumen.set(respuesta);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el cumplimiento de metas.');
        this.cargando.set(false);
      }
    });
  }

  aplicarFiltros(): void {
    const pais = this.paisSeleccionado();
    const continente = pais ? null : this.continenteSeleccionado();

    if (pais) {
      this.continenteSeleccionado.set(null);
    }

    const filtros: FiltrosKpi = {
      anio: this.anioSeleccionado(),
      pais,
      continente,
      plan: this.planSeleccionado(),
      tipoContenido: this.tipoContenidoSeleccionado(),
      prioridadMercado: this.prioridadMercadoSeleccionada()
    };

    this.filtrosAplicados.set(filtros);
    this.cargarMetas(filtros);
  }

  limpiarFiltros(): void {
    this.anioSeleccionado.set(null);
    this.paisSeleccionado.set(null);
    this.continenteSeleccionado.set(null);
    this.planSeleccionado.set(null);
    this.tipoContenidoSeleccionado.set(null);
    this.prioridadMercadoSeleccionada.set(null);

    const filtros: FiltrosKpi = {};
    this.filtrosAplicados.set(filtros);
    this.cargarMetas(filtros);
  }

  actualizarAnio(valor: string | number | null | undefined): void {
    this.anioSeleccionado.set(valor ? Number(valor) : null);
  }

  actualizarPais(valor: string | number | null | undefined): void {
    const pais = valor ? String(valor) : null;

    this.paisSeleccionado.set(pais);

    if (pais) {
      this.continenteSeleccionado.set(null);
    }
  }

  actualizarContinente(valor: string | number | null | undefined): void {
    const continente = valor ? String(valor) : null;

    this.continenteSeleccionado.set(continente);

    if (continente) {
      this.paisSeleccionado.set(null);
    }
  }

  actualizarPlan(valor: string | number | null | undefined): void {
    this.planSeleccionado.set(valor ? String(valor) : null);
  }

  actualizarTipoContenido(valor: string | number | null | undefined): void {
    this.tipoContenidoSeleccionado.set(valor ? String(valor) : null);
  }

  actualizarPrioridadMercado(valor: string | number | null | undefined): void {
    this.prioridadMercadoSeleccionada.set(valor ? String(valor) : null);
  }

  actualizarMetrica(valor: string | number | undefined): void {
    if (valor === 'visualizaciones' || valor === 'horas') {
      this.metricaGrafica.set(valor);
    }
  }

  obtenerMercadoCritico(): CumplimientoMeta | null {
    return this.cumplimiento()[0] ?? null;
  }

  obtenerMejorMercado(): CumplimientoMeta | null {
    const datos = [...this.cumplimiento()];

    if (datos.length === 0) {
      return null;
    }

    return datos.sort(
      (a, b) =>
        this.promedioCumplimiento(b) - this.promedioCumplimiento(a)
    )[0];
  }

  promedioCumplimiento(item: CumplimientoMeta): number {
    return (
      item.porcentajeCumplimientoVisualizaciones +
      item.porcentajeCumplimientoHoras
    ) / 2;
  }

  obtenerColorEstado(estado: string): string {
    const estadoNormalizado = (estado ?? '').toUpperCase();

    if (estadoNormalizado === 'ALTO') {
      return 'success';
    }

    if (estadoNormalizado === 'MEDIO') {
      return 'warning';
    }

    if (estadoNormalizado === 'BAJO') {
      return 'danger';
    }

    return 'medium';
  }

  formatearNumero(valor: number): string {
    return this.formatoNumero.format(valor);
  }

  formatearDecimal(valor: number): string {
    return this.formatoDecimal.format(valor);
  }

  hayFiltrosAplicados(): boolean {
    const filtros = this.filtrosAplicados();

    return Boolean(
      filtros.anio ||
      filtros.pais ||
      filtros.continente ||
      filtros.plan ||
      filtros.tipoContenido ||
      filtros.prioridadMercado
    );
  }

  obtenerResumenFiltros(): string {
    const filtros = this.filtrosAplicados();
    const activos: string[] = [];

    if (filtros.anio) {
      activos.push(`Año ${filtros.anio}`);
    }

    if (filtros.pais) {
      activos.push(`País ${filtros.pais}`);
    }

    if (filtros.continente) {
      activos.push(`Continente ${filtros.continente}`);
    }

    if (filtros.plan) {
      activos.push(`Plan ${filtros.plan}`);
    }

    if (filtros.tipoContenido) {
      activos.push(`Tipo ${filtros.tipoContenido}`);
    }

    if (filtros.prioridadMercado) {
      activos.push(`Prioridad ${filtros.prioridadMercado}`);
    }

    return activos.length > 0 ? activos.join(' · ') : 'Panorama general sin filtros';
  }

  obtenerLecturaEjecutiva(): string {
    const mercadoCritico = this.obtenerMercadoCritico();
    const mejorMercado = this.obtenerMejorMercado();
    const contexto = this.obtenerResumenFiltros().toLowerCase();

    if (!mercadoCritico || !mejorMercado) {
      return 'No hay información suficiente para generar una lectura ejecutiva de metas.';
    }

    return `Bajo el contexto de ${contexto}, ${mercadoCritico.pais} presenta la mayor brecha frente a las metas, mientras que ${mejorMercado.pais} muestra el mejor desempeño relativo. Esta vista permite priorizar acciones en mercados con bajo cumplimiento.`;
  }
}