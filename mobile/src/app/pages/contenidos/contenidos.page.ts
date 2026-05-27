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

import { DesempenoContenido, ResumenDesempenoContenidos } from '../../models/desempeno-contenido.model';
import { FiltrosKpi, OpcionesFiltro } from '../../models/filtros-kpi.model';
import { ContenidoService } from '../../services/contenido.service';
import { FiltroService } from '../../services/filtro.service';
import { InsightCardComponent } from '../../shared/components/insight-card/insight-card.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';

type MetricaContenido = 'visualizaciones' | 'horasVistas' | 'calificacionPromedio' | 'tasaFinalizacion';

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
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonAccordion,
    IonAccordionGroup
  ]
})
export class ContenidosPage implements OnInit {
  private readonly contenidoService = inject(ContenidoService);
  private readonly filtroService = inject(FiltroService);

  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  resumen = signal<ResumenDesempenoContenidos | null>(null);
  opcionesFiltro = signal<OpcionesFiltro | null>(null);

  cargando = signal<boolean>(false);
  cargandoFiltros = signal<boolean>(false);
  error = signal<string | null>(null);

  metricaGrafica = signal<MetricaContenido>('visualizaciones');

  anioSeleccionado = signal<number | null>(null);
  paisSeleccionado = signal<string | null>(null);
  continenteSeleccionado = signal<string | null>(null);
  planSeleccionado = signal<string | null>(null);
  tipoContenidoSeleccionado = signal<string | null>(null);
  generoSeleccionado = signal<string | null>(null);

  filtrosAplicados = signal<FiltrosKpi>({});

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

  contenidosMasVistos = computed<DesempenoContenido[]>(() => {
    return this.resumen()?.contenidosMasVistos ?? [];
  });

  contenidosMejorCalificados = computed<DesempenoContenido[]>(() => {
    return this.resumen()?.contenidosMejorCalificados ?? [];
  });

  contenidosMayorFinalizacion = computed<DesempenoContenido[]>(() => {
    return this.resumen()?.contenidosMayorFinalizacion ?? [];
  });

  contenidoMasVisto = computed<DesempenoContenido | null>(() => {
    return this.contenidosMasVistos()[0] ?? null;
  });

  contenidoMejorCalificado = computed<DesempenoContenido | null>(() => {
    return this.contenidosMejorCalificados()[0] ?? null;
  });

  contenidoMayorFinalizacion = computed<DesempenoContenido | null>(() => {
    return this.contenidosMayorFinalizacion()[0] ?? null;
  });

  datosGraficaComparativa = computed<ChartData<'bar'>>(() => {
    const contenidos = this.contenidosMasVistos();
    const metrica = this.metricaGrafica();

    return {
      labels: contenidos.map((contenido) => this.acortarTitulo(contenido.titulo)),
      datasets: [
        {
          label: this.obtenerEtiquetaMetrica(),
          data: contenidos.map((contenido) => this.obtenerValorMetrica(contenido, metrica))
        }
      ]
    };
  });

  datosGraficaTipos = computed<ChartData<'doughnut'>>(() => {
    const conteo = new Map<string, number>();

    for (const contenido of this.contenidosMasVistos()) {
      const tipo = contenido.tipoContenido || 'Sin tipo';
      conteo.set(tipo, (conteo.get(tipo) ?? 0) + contenido.visualizaciones);
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

  ngOnInit(): void {
    this.cargarOpcionesFiltros();
    this.cargarContenidos();
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

  cargarContenidos(filtros: FiltrosKpi = this.filtrosAplicados()): void {
    this.cargando.set(true);
    this.error.set(null);

    this.contenidoService.obtenerDesempenoContenidos(filtros).subscribe({
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
      genero: this.generoSeleccionado()
    };

    this.filtrosAplicados.set(filtros);
    this.cargarContenidos(filtros);
  }

  limpiarFiltros(): void {
    this.anioSeleccionado.set(null);
    this.paisSeleccionado.set(null);
    this.continenteSeleccionado.set(null);
    this.planSeleccionado.set(null);
    this.tipoContenidoSeleccionado.set(null);
    this.generoSeleccionado.set(null);

    const filtros: FiltrosKpi = {};
    this.filtrosAplicados.set(filtros);
    this.cargarContenidos(filtros);
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

  actualizarGenero(valor: string | number | null | undefined): void {
    this.generoSeleccionado.set(valor ? String(valor) : null);
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

  obtenerValorMetrica(contenido: DesempenoContenido, metrica: MetricaContenido): number {
    return contenido[metrica];
  }

  obtenerEtiquetaMetrica(): string {
    const metrica = this.metricaGrafica();

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

  obtenerVariantePorFinalizacion(valor: number): 'positivo' | 'advertencia' | 'riesgo' | 'normal' {
    if (valor >= 80) {
      return 'positivo';
    }

    if (valor >= 60) {
      return 'advertencia';
    }

    return 'riesgo';
  }

  formatearNumero(valor: number): string {
    return this.formatoNumero.format(valor);
  }

  formatearDecimal(valor: number): string {
    return this.formatoDecimal.format(valor);
  }

  acortarTitulo(titulo: string): string {
    if (!titulo) {
      return 'Sin título';
    }

    return titulo.length > 28 ? `${titulo.slice(0, 28)}...` : titulo;
  }

  hayFiltrosAplicados(): boolean {
    const filtros = this.filtrosAplicados();

    return Boolean(
      filtros.anio ||
      filtros.pais ||
      filtros.continente ||
      filtros.plan ||
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
    const masVisto = this.contenidoMasVisto();
    const mejorCalificado = this.contenidoMejorCalificado();
    const mayorFinalizacion = this.contenidoMayorFinalizacion();
    const contexto = this.obtenerResumenFiltros().toLowerCase();

    if (!masVisto) {
      return 'No hay información suficiente para generar una lectura ejecutiva de contenidos.';
    }

    let lectura = `Bajo el contexto de ${contexto}, "${masVisto.titulo}" lidera por visualizaciones con ${this.formatearNumero(masVisto.visualizaciones)} reproducciones.`;

    if (mejorCalificado) {
      lectura += ` El contenido mejor calificado es "${mejorCalificado.titulo}" con una calificación promedio de ${this.formatearDecimal(mejorCalificado.calificacionPromedio)}.`;
    }

    if (mayorFinalizacion) {
      lectura += ` En finalización, destaca "${mayorFinalizacion.titulo}" con ${this.formatearDecimal(mayorFinalizacion.tasaFinalizacion)}%.`;
    }

    return lectura;
  }
}