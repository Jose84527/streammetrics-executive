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

import { ConsumoGenero, ResumenConsumoGeneros } from '../../models/consumo-genero.model';
import { FiltrosKpi, OpcionesFiltro } from '../../models/filtros-kpi.model';
import { ConsumoService } from '../../services/consumo.service';
import { FiltroService } from '../../services/filtro.service';
import { InsightCardComponent } from '../../shared/components/insight-card/insight-card.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';

type MetricaConsumo = 'visualizaciones' | 'horasVistas';

@Component({
  selector: 'app-consumo',
  templateUrl: './consumo.page.html',
  styleUrls: ['./consumo.page.scss'],
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
    IonChip,
    IonAccordion,
    IonAccordionGroup
  ]
})
export class ConsumoPage implements OnInit {
  private readonly consumoService = inject(ConsumoService);
  private readonly filtroService = inject(FiltroService);

  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  resumen = signal<ResumenConsumoGeneros | null>(null);
  opcionesFiltro = signal<OpcionesFiltro | null>(null);

  cargando = signal<boolean>(false);
  cargandoFiltros = signal<boolean>(false);
  error = signal<string | null>(null);

  metricaGrafica = signal<MetricaConsumo>('visualizaciones');

  anioSeleccionado = signal<number | null>(null);
  paisSeleccionado = signal<string | null>(null);
  continenteSeleccionado = signal<string | null>(null);
  planSeleccionado = signal<string | null>(null);
  tipoContenidoSeleccionado = signal<string | null>(null);

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

  totalVisualizaciones = computed<number>(() => {
    return this.resumen()?.generosPorVisualizaciones.reduce(
      (total, genero) => total + genero.visualizaciones,
      0
    ) ?? 0;
  });

  totalHorasVistas = computed<number>(() => {
    return this.resumen()?.generosPorVisualizaciones.reduce(
      (total, genero) => total + genero.horasVistas,
      0
    ) ?? 0;
  });

  topCincoGeneros = computed<ConsumoGenero[]>(() => {
    return this.resumen()?.generosPorVisualizaciones.slice(0, 5) ?? [];
  });

  datosGraficaDona = computed<ChartData<'doughnut'>>(() => {
    const generos = this.resumen()?.generosPorVisualizaciones ?? [];
    const topCinco = generos.slice(0, 5);
    const resto = generos.slice(5);

    const totalOtros = resto.reduce(
      (total, genero) => total + genero.visualizaciones,
      0
    );

    const labels = topCinco.map((genero) => genero.nombre);
    const data = topCinco.map((genero) => genero.visualizaciones);

    if (totalOtros > 0) {
      labels.push('Otros');
      data.push(totalOtros);
    }

    return {
      labels,
      datasets: [
        {
          data
        }
      ]
    };
  });

  datosGraficaBarras = computed<ChartData<'bar'>>(() => {
    const generos = this.resumen()?.generosPorVisualizaciones ?? [];
    const metrica = this.metricaGrafica();

    return {
      labels: generos.map((genero) => genero.nombre),
      datasets: [
        {
          label: metrica === 'visualizaciones' ? 'Visualizaciones' : 'Horas vistas',
          data: generos.map((genero) =>
            metrica === 'visualizaciones'
              ? genero.visualizaciones
              : genero.horasVistas
          )
        }
      ]
    };
  });

  ngOnInit(): void {
    this.cargarOpcionesFiltros();
    this.cargarConsumo();
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

  cargarConsumo(filtros: FiltrosKpi = this.filtrosAplicados()): void {
    this.cargando.set(true);
    this.error.set(null);

    this.consumoService.obtenerResumenGeneros(filtros).subscribe({
      next: (respuesta) => {
        this.resumen.set(respuesta);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el análisis de consumo por géneros.');
        this.cargando.set(false);
      }
    });
  }

  aplicarFiltros(): void {
    const filtros: FiltrosKpi = {
      anio: this.anioSeleccionado(),
      pais: this.paisSeleccionado(),
      continente: this.continenteSeleccionado(),
      plan: this.planSeleccionado(),
      tipoContenido: this.tipoContenidoSeleccionado()
    };

    this.filtrosAplicados.set(filtros);
    this.cargarConsumo(filtros);
  }

  limpiarFiltros(): void {
    this.anioSeleccionado.set(null);
    this.paisSeleccionado.set(null);
    this.continenteSeleccionado.set(null);
    this.planSeleccionado.set(null);
    this.tipoContenidoSeleccionado.set(null);

    const filtros: FiltrosKpi = {};
    this.filtrosAplicados.set(filtros);
    this.cargarConsumo(filtros);
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

  actualizarMetrica(valor: string | number | undefined): void {
    if (valor === 'visualizaciones' || valor === 'horasVistas') {
      this.metricaGrafica.set(valor);
    }
  }

  obtenerGeneroLider(): ConsumoGenero | null {
    return this.resumen()?.generosPorVisualizaciones?.[0] ?? null;
  }

  obtenerGeneroMayorHoras(): ConsumoGenero | null {
    return this.resumen()?.generosPorHorasVistas?.[0] ?? null;
  }

  formatearNumero(valor: number): string {
    return this.formatoNumero.format(valor);
  }

  formatearDecimal(valor: number): string {
    return this.formatoDecimal.format(valor);
  }

  obtenerPorcentajeGenero(genero: ConsumoGenero): string {
    const total = this.totalVisualizaciones();

    if (total === 0) {
      return '0.00';
    }

    return this.formatearDecimal((genero.visualizaciones / total) * 100);
  }

  obtenerPorcentajeBarra(genero: ConsumoGenero): number {
    const lider = this.obtenerGeneroLider();

    if (!lider || lider.visualizaciones === 0) {
      return 0;
    }

    return (genero.visualizaciones / lider.visualizaciones) * 100;
  }

  hayFiltrosAplicados(): boolean {
    const filtros = this.filtrosAplicados();

    return Boolean(
      filtros.anio ||
      filtros.pais ||
      filtros.continente ||
      filtros.plan ||
      filtros.tipoContenido
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

    return activos.length > 0 ? activos.join(' · ') : 'Panorama general sin filtros';
  }

  obtenerLecturaEjecutiva(): string {
    const generoLider = this.obtenerGeneroLider();
    const generoMayorHoras = this.obtenerGeneroMayorHoras();
    const contexto = this.obtenerResumenFiltros().toLowerCase();

    if (!generoLider || !generoMayorHoras) {
      return 'No hay información suficiente para generar una lectura ejecutiva de consumo.';
    }

    return `Bajo el contexto de ${contexto}, el género ${generoLider.nombre} lidera por visualizaciones, mientras que ${generoMayorHoras.nombre} concentra el mayor tiempo de consumo. Esto permite comparar preferencias de audiencia según periodo, mercado, plan o tipo de contenido.`;
  }
}