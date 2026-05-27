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

import { ActividadPerfil, ResumenActividadPerfiles } from '../../models/actividad-perfil.model';
import { FiltrosKpi, OpcionesFiltro } from '../../models/filtros-kpi.model';
import { FiltroService } from '../../services/filtro.service';
import { PerfilService } from '../../services/perfil.service';
import { InsightCardComponent } from '../../shared/components/insight-card/insight-card.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';

type MetricaPerfil = 'totalPerfiles' | 'promedioDias';

@Component({
  selector: 'app-perfiles',
  templateUrl: './perfiles.page.html',
  styleUrls: ['./perfiles.page.scss'],
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
export class PerfilesPage implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly filtroService = inject(FiltroService);

  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  resumen = signal<ResumenActividadPerfiles | null>(null);
  opcionesFiltro = signal<OpcionesFiltro | null>(null);

  cargando = signal<boolean>(false);
  cargandoFiltros = signal<boolean>(false);
  error = signal<string | null>(null);

  metricaGrafica = signal<MetricaPerfil>('totalPerfiles');

  anioSeleccionado = signal<number | null>(null);
  paisSeleccionado = signal<string | null>(null);
  continenteSeleccionado = signal<string | null>(null);
  planSeleccionado = signal<string | null>(null);
  nivelActividadSeleccionado = signal<string | null>(null);

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

  actividad = computed<ActividadPerfil[]>(() => {
    return this.resumen()?.actividadPerfiles ?? [];
  });

  totalPerfiles = computed<number>(() => {
    return this.actividad().reduce(
      (total, item) => total + item.totalPerfiles,
      0
    );
  });

  promedioGlobalDias = computed<number>(() => {
    const total = this.totalPerfiles();

    if (total === 0) {
      return 0;
    }

    const sumaPonderada = this.actividad().reduce(
      (totalDias, item) =>
        totalDias + item.promedioDiasSinActividad * item.totalPerfiles,
      0
    );

    return sumaPonderada / total;
  });

  datosGraficaDistribucion = computed<ChartData<'doughnut'>>(() => {
    const actividad = this.actividad();

    return {
      labels: actividad.map((item) => item.nivelActividad),
      datasets: [
        {
          data: actividad.map((item) => item.totalPerfiles)
        }
      ]
    };
  });

  datosGraficaBarras = computed<ChartData<'bar'>>(() => {
    const actividad = this.actividad();
    const metrica = this.metricaGrafica();

    return {
      labels: actividad.map((item) => item.nivelActividad),
      datasets: [
        {
          label: metrica === 'totalPerfiles'
            ? 'Total de perfiles'
            : 'Promedio de días sin actividad',
          data: actividad.map((item) =>
            metrica === 'totalPerfiles'
              ? item.totalPerfiles
              : item.promedioDiasSinActividad
          )
        }
      ]
    };
  });

  ngOnInit(): void {
    this.cargarOpcionesFiltros();
    this.cargarPerfiles();
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

  cargarPerfiles(filtros: FiltrosKpi = this.filtrosAplicados()): void {
    this.cargando.set(true);
    this.error.set(null);

    this.perfilService.obtenerActividadPerfiles(filtros).subscribe({
      next: (respuesta) => {
        this.resumen.set(respuesta);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el análisis de actividad de perfiles.');
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
      nivelActividad: this.nivelActividadSeleccionado()
    };

    this.filtrosAplicados.set(filtros);
    this.cargarPerfiles(filtros);
  }

  limpiarFiltros(): void {
    this.anioSeleccionado.set(null);
    this.paisSeleccionado.set(null);
    this.continenteSeleccionado.set(null);
    this.planSeleccionado.set(null);
    this.nivelActividadSeleccionado.set(null);

    const filtros: FiltrosKpi = {};
    this.filtrosAplicados.set(filtros);
    this.cargarPerfiles(filtros);
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

  actualizarNivelActividad(valor: string | number | null | undefined): void {
    this.nivelActividadSeleccionado.set(valor ? String(valor) : null);
  }

  actualizarMetrica(valor: string | number | undefined): void {
    if (valor === 'totalPerfiles' || valor === 'promedioDias') {
      this.metricaGrafica.set(valor);
    }
  }

  obtenerNivelPrincipal(): ActividadPerfil | null {
    return this.actividad()[0] ?? null;
  }

  obtenerNivelCritico(): ActividadPerfil | null {
    return this.actividad()
      .filter((item) => this.esNivelCritico(item.nivelActividad))
      .sort((a, b) => b.totalPerfiles - a.totalPerfiles)[0] ?? null;
  }

  esNivelCritico(nivel: string): boolean {
    const valor = (nivel ?? '').toLowerCase();

    return valor.includes('riesgo')
      || valor.includes('inactivo')
      || valor.includes('abandono');
  }

  obtenerColorNivel(nivel: string): string {
    const valor = (nivel ?? '').toLowerCase();

    if (valor.includes('activo') && !valor.includes('inactivo')) {
      return 'success';
    }

    if (valor.includes('riesgo')) {
      return 'warning';
    }

    if (valor.includes('inactivo') || valor.includes('abandono')) {
      return 'danger';
    }

    return 'medium';
  }

  obtenerPorcentajePerfil(item: ActividadPerfil): string {
    const total = this.totalPerfiles();

    if (total === 0) {
      return '0.00';
    }

    return this.formatearDecimal((item.totalPerfiles / total) * 100);
  }

  obtenerPorcentajeBarra(item: ActividadPerfil): number {
    const principal = this.obtenerNivelPrincipal();

    if (!principal || principal.totalPerfiles === 0) {
      return 0;
    }

    return (item.totalPerfiles / principal.totalPerfiles) * 100;
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
      filtros.nivelActividad
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

    if (filtros.nivelActividad) {
      activos.push(`Nivel ${filtros.nivelActividad}`);
    }

    return activos.length > 0 ? activos.join(' · ') : 'Panorama general sin filtros';
  }

  obtenerLecturaEjecutiva(): string {
    const nivelPrincipal = this.obtenerNivelPrincipal();
    const nivelCritico = this.obtenerNivelCritico();
    const contexto = this.obtenerResumenFiltros().toLowerCase();

    if (!nivelPrincipal) {
      return 'No hay información suficiente para generar una lectura ejecutiva de perfiles.';
    }

    if (nivelCritico) {
      return `Bajo el contexto de ${contexto}, el grupo predominante es "${nivelPrincipal.nivelActividad}", mientras que el segmento crítico más relevante es "${nivelCritico.nivelActividad}" con ${this.formatearNumero(nivelCritico.totalPerfiles)} perfiles. Se recomienda priorizar acciones de reactivación y seguimiento para reducir riesgo de abandono.`;
    }

    return `Bajo el contexto de ${contexto}, el grupo predominante es "${nivelPrincipal.nivelActividad}" con ${this.formatearNumero(nivelPrincipal.totalPerfiles)} perfiles. El comportamiento general muestra una base de usuarios con actividad estable dentro del segmento analizado.`;
  }
}