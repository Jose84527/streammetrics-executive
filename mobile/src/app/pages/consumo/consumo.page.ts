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
  IonCol,
  IonContent,
  IonGrid,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';

import { ConsumoGenero, ResumenConsumoGeneros } from '../../models/consumo-genero.model';
import { ConsumoService } from '../../services/consumo.service';
import { InsightCardComponent } from '../../shared/components/insight-card/insight-card.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';

type MetricaGrafica = 'visualizaciones' | 'horasVistas';

interface GeneroConIndice extends ConsumoGenero {
  indiceEjecutivo: number;
}

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
    IonGrid,
    IonRow,
    IonCol,
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
export class ConsumoPage implements OnInit {
  private readonly consumoService = inject(ConsumoService);
  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  resumen = signal<ResumenConsumoGeneros | null>(null);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  generosSeleccionados = signal<string[]>([]);
  metricaGrafica = signal<MetricaGrafica>('visualizaciones');

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

  topCincoGeneral = computed<GeneroConIndice[]>(() => {
    const datos = this.resumen();

    if (!datos) {
      return [];
    }

    const generos = this.obtenerGenerosUnicos(datos);
    const maxVisualizaciones = Math.max(...generos.map((genero) => genero.visualizaciones), 1);
    const maxHoras = Math.max(...generos.map((genero) => genero.horasVistas), 1);

    return generos
      .map((genero) => ({
        ...genero,
        indiceEjecutivo:
          ((genero.visualizaciones / maxVisualizaciones) * 50) +
          ((genero.horasVistas / maxHoras) * 50)
      }))
      .sort((a, b) => b.indiceEjecutivo - a.indiceEjecutivo)
      .slice(0, 5);
  });

  datosGraficaDona = computed<ChartData<'doughnut'>>(() => {
  const datos = this.resumen();

  if (!datos) {
    return {
      labels: [],
      datasets: []
    };
  }

  const generos = this.obtenerGenerosUnicos(datos);
  const topCinco = this.topCincoGeneral();

  const totalVisualizacionesGeneral = generos.reduce(
    (total, genero) => total + genero.visualizaciones,
    0
  );

  const totalVisualizacionesTopCinco = topCinco.reduce(
    (total, genero) => total + genero.visualizaciones,
    0
  );

  const visualizacionesOtros =
    totalVisualizacionesGeneral - totalVisualizacionesTopCinco;

  const etiquetas = topCinco.map((genero) => genero.nombre);
  const valores = topCinco.map((genero) => genero.visualizaciones);

  if (visualizacionesOtros > 0) {
    etiquetas.push('Resto de géneros');
    valores.push(visualizacionesOtros);
  }

  return {
    labels: etiquetas,
    datasets: [
      {
        data: valores
      }
    ]
  };
});

  datosGraficaBarras = computed<ChartData<'bar'>>(() => {
    const datos = this.resumen();
    const metrica = this.metricaGrafica();

    if (!datos) {
      return {
        labels: [],
        datasets: []
      };
    }

    const generos = this.obtenerGenerosParaComparacion(datos);
    const etiqueta = metrica === 'visualizaciones' ? 'Visualizaciones' : 'Horas vistas';

    return {
      labels: generos.map((genero) => genero.nombre),
      datasets: [
        {
          label: etiqueta,
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
    this.cargarConsumo();
  }

  cargarConsumo(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.consumoService.obtenerResumenGeneros().subscribe({
      next: (respuesta) => {
        this.resumen.set(respuesta);
        this.establecerSeleccionInicial(respuesta);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el análisis de consumo.');
        this.cargando.set(false);
      }
    });
  }

  actualizarSeleccionGeneros(valor: string[] | string | null | undefined): void {
    if (Array.isArray(valor)) {
      this.generosSeleccionados.set(valor);
      return;
    }

    if (typeof valor === 'string') {
      this.generosSeleccionados.set([valor]);
      return;
    }

    this.generosSeleccionados.set([]);
  }

  actualizarMetrica(valor: string | number | undefined): void {
    if (valor === 'visualizaciones' || valor === 'horasVistas') {
      this.metricaGrafica.set(valor);
    }
  }

  restablecerTopCinco(): void {
    this.generosSeleccionados.set(
      this.topCincoGeneral().map((genero) => genero.nombre)
    );
  }

  obtenerPrimerGeneroGeneral(): GeneroConIndice | null {
    return this.topCincoGeneral()[0] ?? null;
  }

  formatearNumero(valor: number): string {
    return this.formatoNumero.format(valor);
  }

  formatearDecimal(valor: number): string {
    return this.formatoDecimal.format(valor);
  }

  obtenerLecturaEjecutiva(): string {
    const generoPrincipal = this.obtenerPrimerGeneroGeneral();

    if (!generoPrincipal) {
      return 'No hay información suficiente para generar una lectura ejecutiva.';
    }

    return `El género ${generoPrincipal.nombre} encabeza el ranking ejecutivo al combinar visualizaciones y horas vistas. Esto lo convierte en una categoría clave para recomendaciones, campañas de contenido y decisiones de catálogo.`;
  }

  obtenerDetalleIndice(genero: GeneroConIndice): string {
    return `Índice ejecutivo: ${this.formatearDecimal(genero.indiceEjecutivo)} / 100`;
  }

  private establecerSeleccionInicial(respuesta: ResumenConsumoGeneros): void {
    const generos = this.obtenerGenerosUnicos(respuesta);
    const maxVisualizaciones = Math.max(...generos.map((genero) => genero.visualizaciones), 1);
    const maxHoras = Math.max(...generos.map((genero) => genero.horasVistas), 1);

    const topCinco = generos
      .map((genero) => ({
        ...genero,
        indiceEjecutivo:
          ((genero.visualizaciones / maxVisualizaciones) * 50) +
          ((genero.horasVistas / maxHoras) * 50)
      }))
      .sort((a, b) => b.indiceEjecutivo - a.indiceEjecutivo)
      .slice(0, 5)
      .map((genero) => genero.nombre);

    this.generosSeleccionados.set(topCinco);
  }

  private obtenerGenerosParaComparacion(datos: ResumenConsumoGeneros): ConsumoGenero[] {
    const generos = this.obtenerGenerosUnicos(datos);
    const seleccionados = this.generosSeleccionados();

    if (seleccionados.length === 0) {
      return this.topCincoGeneral();
    }

    return generos.filter((genero) => seleccionados.includes(genero.nombre));
  }

  private obtenerGenerosUnicos(datos: ResumenConsumoGeneros): ConsumoGenero[] {
    const mapa = new Map<string, ConsumoGenero>();

    for (const genero of datos.generosPorVisualizaciones) {
      mapa.set(genero.nombre, genero);
    }

    for (const genero of datos.generosPorHorasVistas) {
      if (!mapa.has(genero.nombre)) {
        mapa.set(genero.nombre, genero);
      }
    }

    return Array.from(mapa.values());
  }
}