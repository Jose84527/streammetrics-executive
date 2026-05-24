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
import { ChartData, ChartOptions } from 'chart.js';

import { ConsumoMercado, ResumenMercados } from '../../models/mercado-consumo.model';
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
export class MercadosPage implements OnInit {
  private readonly mercadoService = inject(MercadoService);

  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  resumen = signal<ResumenMercados | null>(null);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  paisesSeleccionados = signal<string[]>([]);
  metricaGrafica = signal<MetricaMercado>('visualizaciones');

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

  topCincoPaises = computed<ConsumoMercado[]>(() => {
    return this.resumen()?.paisesMayorConsumo.slice(0, 5) ?? [];
  });

  datosGraficaContinentes = computed<ChartData<'doughnut'>>(() => {
    const continentes = this.resumen()?.continentesMayorConsumo ?? [];

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
    const datos = this.resumen();
    const metrica = this.metricaGrafica();

    if (!datos) {
      return {
        labels: [],
        datasets: []
      };
    }

    const paises = this.obtenerPaisesParaComparacion(datos);
    const etiqueta = metrica === 'visualizaciones' ? 'Visualizaciones' : 'Horas vistas';

    return {
      labels: paises.map((pais) => pais.nombre),
      datasets: [
        {
          label: etiqueta,
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
    this.cargarMercados();
  }

  cargarMercados(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.mercadoService.obtenerResumenMercados().subscribe({
      next: (respuesta) => {
        this.resumen.set(respuesta);
        this.establecerSeleccionInicial(respuesta);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el análisis de mercados.');
        this.cargando.set(false);
      }
    });
  }

  obtenerPaisLider(): ConsumoMercado | null {
    return this.resumen()?.paisesMayorConsumo?.[0] ?? null;
  }

  obtenerContinenteLider(): ConsumoMercado | null {
    return this.resumen()?.continentesMayorConsumo?.[0] ?? null;
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
    if (valor === 'visualizaciones' || valor === 'horasVistas') {
      this.metricaGrafica.set(valor);
    }
  }

  restablecerTopCinco(): void {
    this.paisesSeleccionados.set(
      this.topCincoPaises().map((pais) => pais.nombre)
    );
  }

  formatearNumero(valor: number): string {
    return this.formatoNumero.format(valor);
  }

  formatearDecimal(valor: number): string {
    return this.formatoDecimal.format(valor);
  }

  obtenerLecturaEjecutiva(): string {
    const pais = this.obtenerPaisLider();
    const continente = this.obtenerContinenteLider();

    if (!pais || !continente) {
      return 'No hay información suficiente para generar una lectura ejecutiva de mercados.';
    }

    return `El mercado con mayor consumo es ${pais.nombre}, mientras que la región dominante es ${continente.nombre}. Esto permite priorizar campañas, recomendaciones y decisiones de catálogo en los mercados con mayor actividad.`;
  }

  private establecerSeleccionInicial(respuesta: ResumenMercados): void {
    this.paisesSeleccionados.set(
      respuesta.paisesMayorConsumo
        .slice(0, 5)
        .map((pais) => pais.nombre)
    );
  }

  private obtenerPaisesParaComparacion(datos: ResumenMercados): ConsumoMercado[] {
    const seleccionados = this.paisesSeleccionados();

    if (seleccionados.length === 0) {
      return datos.paisesMayorConsumo.slice(0, 5);
    }

    return datos.paisesMayorConsumo.filter((pais) =>
      seleccionados.includes(pais.nombre)
    );
  }
}