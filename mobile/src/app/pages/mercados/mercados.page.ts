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
import { ConsumoMercado, ResumenMercados } from '../../models/mercado-consumo.model';
import { FiltroService } from '../../services/filtro.service';
import { MercadoService } from '../../services/mercado.service';
import { InsightCardComponent } from '../../shared/components/insight-card/insight-card.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';

type MetricaMercado = 'visualizaciones' | 'horasVistas';

@Component({
  selector: 'app-mercados',
  templateUrl: './mercados.page.html',
  styleUrls: ['./mercados.page.scss'],
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
export class MercadosPage implements OnInit {
  private readonly mercadoService = inject(MercadoService);
  private readonly filtroService = inject(FiltroService);

  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  resumen = signal<ResumenMercados | null>(null);
  opcionesFiltro = signal<OpcionesFiltro | null>(null);

  cargando = signal<boolean>(false);
  cargandoFiltros = signal<boolean>(false);
  error = signal<string | null>(null);

  metricaGrafica = signal<MetricaMercado>('visualizaciones');

  anioSeleccionado = signal<number | null>(null);
  continenteSeleccionado = signal<string | null>(null);
  planSeleccionado = signal<string | null>(null);
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

  paises = computed<ConsumoMercado[]>(() => {
    return this.resumen()?.paisesMayorConsumo ?? [];
  });

  continentes = computed<ConsumoMercado[]>(() => {
    return this.resumen()?.continentesMayorConsumo ?? [];
  });

  totalVisualizaciones = computed<number>(() => {
    return this.paises().reduce(
      (total, mercado) => total + mercado.visualizaciones,
      0
    );
  });

  totalHorasVistas = computed<number>(() => {
    return this.paises().reduce(
      (total, mercado) => total + mercado.horasVistas,
      0
    );
  });

  topCincoPaises = computed<ConsumoMercado[]>(() => {
    return this.paises().slice(0, 5);
  });

  topDiezPaises = computed<ConsumoMercado[]>(() => {
    return this.paises().slice(0, 10);
  });

  datosGraficaContinentes = computed<ChartData<'doughnut'>>(() => {
    const continentes = this.continentes();

    return {
      labels: continentes.map((continente) => continente.nombre),
      datasets: [
        {
          data: continentes.map((continente) => continente.visualizaciones)
        }
      ]
    };
  });

  datosGraficaPaises = computed<ChartData<'bar'>>(() => {
    const paises = this.topDiezPaises();
    const metrica = this.metricaGrafica();

    return {
      labels: paises.map((pais) => pais.nombre),
      datasets: [
        {
          label: metrica === 'visualizaciones' ? 'Visualizaciones' : 'Horas vistas',
          data: paises.map((pais) =>
            metrica === 'visualizaciones'
              ? pais.visualizaciones
              : pais.horasVistas
          )
        }
      ]
    };
  });

  ngOnInit(): void {
    this.cargarOpcionesFiltros();
    this.cargarMercados();
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

  cargarMercados(filtros: FiltrosKpi = this.filtrosAplicados()): void {
    this.cargando.set(true);
    this.error.set(null);

    this.mercadoService.obtenerResumenMercados(filtros).subscribe({
      next: (respuesta) => {
        this.resumen.set(respuesta);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el análisis de mercados.');
        this.cargando.set(false);
      }
    });
  }

  aplicarFiltros(): void {
    const filtros: FiltrosKpi = {
      anio: this.anioSeleccionado(),
      continente: this.continenteSeleccionado(),
      plan: this.planSeleccionado(),
      tipoContenido: this.tipoContenidoSeleccionado(),
      genero: this.generoSeleccionado()
    };

    this.filtrosAplicados.set(filtros);
    this.cargarMercados(filtros);
  }

  limpiarFiltros(): void {
    this.anioSeleccionado.set(null);
    this.continenteSeleccionado.set(null);
    this.planSeleccionado.set(null);
    this.tipoContenidoSeleccionado.set(null);
    this.generoSeleccionado.set(null);

    const filtros: FiltrosKpi = {};
    this.filtrosAplicados.set(filtros);
    this.cargarMercados(filtros);
  }

  actualizarAnio(valor: string | number | null | undefined): void {
    this.anioSeleccionado.set(valor ? Number(valor) : null);
  }

  actualizarContinente(valor: string | number | null | undefined): void {
    this.continenteSeleccionado.set(valor ? String(valor) : null);
  }

  actualizarPlan(valor: string | number | null | undefined): void {
    this.planSeleccionado.set(valor ? String(valor) : null);
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

  obtenerPaisLider(): ConsumoMercado | null {
    return this.paises()[0] ?? null;
  }

  obtenerContinenteLider(): ConsumoMercado | null {
    return this.continentes()[0] ?? null;
  }

  formatearNumero(valor: number): string {
    return this.formatoNumero.format(valor);
  }

  formatearDecimal(valor: number): string {
    return this.formatoDecimal.format(valor);
  }

  obtenerPorcentajeMercado(mercado: ConsumoMercado): string {
    const total = this.totalVisualizaciones();

    if (total === 0) {
      return '0.00';
    }

    return this.formatearDecimal((mercado.visualizaciones / total) * 100);
  }

  obtenerPorcentajeBarra(mercado: ConsumoMercado): number {
    const lider = this.obtenerPaisLider();

    if (!lider || lider.visualizaciones === 0) {
      return 0;
    }

    return (mercado.visualizaciones / lider.visualizaciones) * 100;
  }

  hayFiltrosAplicados(): boolean {
    const filtros = this.filtrosAplicados();

    return Boolean(
      filtros.anio ||
      filtros.continente ||
      filtros.plan ||
      filtros.tipoContenido ||
      filtros.genero
    );
  }

  hayFiltroContinenteAplicado(): boolean {
    return Boolean(this.filtrosAplicados().continente);
  }

  obtenerContinenteFiltrado(): string {
    return this.filtrosAplicados().continente ?? '';
  }

  obtenerResumenFiltros(): string {
    const filtros = this.filtrosAplicados();
    const activos: string[] = [];

    if (filtros.anio) {
      activos.push(`Año ${filtros.anio}`);
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

    if (filtros.genero) {
      activos.push(`Género ${filtros.genero}`);
    }

    return activos.length > 0 ? activos.join(' · ') : 'Panorama general sin filtros';
  }

  obtenerLecturaEjecutiva(): string {
    const paisLider = this.obtenerPaisLider();
    const continenteLider = this.obtenerContinenteLider();
    const contexto = this.obtenerResumenFiltros().toLowerCase();

    if (!paisLider) {
      return 'No hay información suficiente para generar una lectura ejecutiva de mercados.';
    }

    if (this.hayFiltroContinenteAplicado()) {
      return `Bajo el contexto de ${contexto}, ${paisLider.nombre} lidera el consumo dentro del continente seleccionado. Esta vista permite comparar países del mismo mercado regional y detectar oportunidades específicas por territorio.`;
    }

    if (!continenteLider) {
      return 'No hay información suficiente para generar una lectura ejecutiva de mercados.';
    }

    return `Bajo el contexto de ${contexto}, ${paisLider.nombre} lidera el consumo por país, mientras que ${continenteLider.nombre} concentra el mayor consumo por continente. Esta vista permite comparar mercados y detectar regiones con mayor oportunidad estratégica.`;
  }
}