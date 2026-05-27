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

import { FiltrosKpi, OpcionesFiltro } from '../../models/filtros-kpi.model';
import { ConsumoPlan, ResumenPlanes } from '../../models/plan-consumo.model';
import { FiltroService } from '../../services/filtro.service';
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
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonAccordion,
    IonAccordionGroup
  ]
})
export class PlanesPage implements OnInit {
  private readonly planService = inject(PlanService);
  private readonly filtroService = inject(FiltroService);

  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  resumen = signal<ResumenPlanes | null>(null);
  opcionesFiltro = signal<OpcionesFiltro | null>(null);

  cargando = signal<boolean>(false);
  cargandoFiltros = signal<boolean>(false);
  error = signal<string | null>(null);

  metricaGrafica = signal<MetricaPlan>('visualizaciones');

  anioSeleccionado = signal<number | null>(null);
  paisSeleccionado = signal<string | null>(null);
  continenteSeleccionado = signal<string | null>(null);
  tipoContenidoSeleccionado = signal<string | null>(null);
  generoSeleccionado = signal<string | null>(null);

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
        beginAtZero: true
      },
      y: {
        ticks: {
          autoSkip: false
        }
      }
    }
  };

  planes = computed<ConsumoPlan[]>(() => {
    return this.resumen()?.planes ?? [];
  });

  totalVisualizaciones = computed<number>(() => {
    return this.planes().reduce(
      (total, plan) => total + plan.visualizaciones,
      0
    );
  });

  totalHorasVistas = computed<number>(() => {
    return this.planes().reduce(
      (total, plan) => total + plan.horasVistas,
      0
    );
  });

  datosGraficaDona = computed<ChartData<'doughnut'>>(() => {
    const planes = this.planes();

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
    const planes = this.planes();
    const metrica = this.metricaGrafica();

    return {
      labels: planes.map((plan) => plan.nombre),
      datasets: [
        {
          label: metrica === 'visualizaciones' ? 'Visualizaciones' : 'Horas vistas',
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
    this.cargarOpcionesFiltros();
    this.cargarPlanes();
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

  cargarPlanes(filtros: FiltrosKpi = this.filtrosAplicados()): void {
    this.cargando.set(true);
    this.error.set(null);

    this.planService.obtenerConsumoPlanes(filtros).subscribe({
      next: (respuesta) => {
        this.resumen.set(respuesta);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el análisis de consumo por planes.');
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
    tipoContenido: this.tipoContenidoSeleccionado(),
    genero: this.generoSeleccionado()
  };

  this.filtrosAplicados.set(filtros);
  this.cargarPlanes(filtros);
}

  limpiarFiltros(): void {
    this.anioSeleccionado.set(null);
    this.paisSeleccionado.set(null);
    this.continenteSeleccionado.set(null);
    this.tipoContenidoSeleccionado.set(null);
    this.generoSeleccionado.set(null);

    const filtros: FiltrosKpi = {};
    this.filtrosAplicados.set(filtros);
    this.cargarPlanes(filtros);
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

  actualizarTipoContenido(valor: string | number | null | undefined): void {
    this.tipoContenidoSeleccionado.set(valor ? String(valor) : null);
  }

  actualizarGenero(valor: string | number | null | undefined): void {
    this.generoSeleccionado.set(valor ? String(valor) : null);
  }

  actualizarMetrica(valor: string | number | undefined): void {
    if (valor === 'visualizaciones' || valor === 'horasVistas') {
      this.metricaGrafica.set(valor);
    }
  }

  obtenerPlanLider(): ConsumoPlan | null {
    return this.planes()[0] ?? null;
  }

  formatearNumero(valor: number): string {
    return this.formatoNumero.format(valor);
  }

  formatearDecimal(valor: number): string {
    return this.formatoDecimal.format(valor);
  }

  obtenerPorcentajePlan(plan: ConsumoPlan): string {
    const total = this.totalVisualizaciones();

    if (total === 0) {
      return '0.00';
    }

    return this.formatearDecimal((plan.visualizaciones / total) * 100);
  }

  obtenerPorcentajeBarra(plan: ConsumoPlan): number {
    const lider = this.obtenerPlanLider();

    if (!lider || lider.visualizaciones === 0) {
      return 0;
    }

    return (plan.visualizaciones / lider.visualizaciones) * 100;
  }

  hayFiltrosAplicados(): boolean {
    const filtros = this.filtrosAplicados();

    return Boolean(
      filtros.anio ||
      filtros.pais ||
      filtros.continente ||
      filtros.tipoContenido ||
      filtros.genero
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

    if (filtros.tipoContenido) {
      activos.push(`Tipo ${filtros.tipoContenido}`);
    }

    if (filtros.genero) {
      activos.push(`Género ${filtros.genero}`);
    }

    return activos.length > 0 ? activos.join(' · ') : 'Panorama general sin filtros';
  }

  obtenerLecturaEjecutiva(): string {
    const planLider = this.obtenerPlanLider();
    const contexto = this.obtenerResumenFiltros().toLowerCase();

    if (!planLider) {
      return 'No hay información suficiente para generar una lectura ejecutiva de planes.';
    }

    return `Bajo el contexto de ${contexto}, el plan ${planLider.nombre} lidera el consumo por visualizaciones y concentra ${this.obtenerPorcentajePlan(planLider)}% del total analizado. Esta vista permite comparar el desempeño de los planes según mercado, periodo, tipo de contenido o género.`;
  }
}