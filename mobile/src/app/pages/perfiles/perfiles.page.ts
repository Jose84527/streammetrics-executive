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
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

import {
  ActividadPerfil,
  ResumenActividadPerfiles
} from '../../models/actividad-perfil.model';
import { PerfilService } from '../../services/perfil.service';
import { InsightCardComponent } from '../../shared/components/insight-card/insight-card.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';

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
    IonBadge
  ]
})
export class PerfilesPage implements OnInit {
  private readonly perfilService = inject(PerfilService);

  private readonly formatoNumero = new Intl.NumberFormat('es-MX');
  private readonly formatoDecimal = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  resumen = signal<ResumenActividadPerfiles | null>(null);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

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

  totalPerfilesAnalizados = computed<number>(() => {
    return this.resumen()?.actividadPerfiles.reduce(
      (total, grupo) => total + grupo.totalPerfiles,
      0
    ) ?? 0;
  });

  gruposOrdenadosPorTotal = computed<ActividadPerfil[]>(() => {
    return [...(this.resumen()?.actividadPerfiles ?? [])].sort(
      (a, b) => b.totalPerfiles - a.totalPerfiles
    );
  });

  gruposOrdenadosPorInactividad = computed<ActividadPerfil[]>(() => {
    return [...(this.resumen()?.actividadPerfiles ?? [])].sort(
      (a, b) => b.promedioDiasSinActividad - a.promedioDiasSinActividad
    );
  });

  perfilesEnRiesgo = computed<number>(() => {
    return this.resumen()?.actividadPerfiles
      .filter((grupo) => this.esGrupoCritico(grupo.nivelActividad))
      .reduce((total, grupo) => total + grupo.totalPerfiles, 0) ?? 0;
  });

  datosGraficaDistribucion = computed<ChartData<'doughnut'>>(() => {
    const grupos = this.gruposOrdenadosPorTotal();

    return {
      labels: grupos.map((grupo) => grupo.nivelActividad),
      datasets: [
        {
          data: grupos.map((grupo) => grupo.totalPerfiles)
        }
      ]
    };
  });

  datosGraficaInactividad = computed<ChartData<'bar'>>(() => {
    const grupos = this.gruposOrdenadosPorInactividad();

    return {
      labels: grupos.map((grupo) => grupo.nivelActividad),
      datasets: [
        {
          label: 'Promedio de días sin actividad',
          data: grupos.map((grupo) => grupo.promedioDiasSinActividad)
        }
      ]
    };
  });

  ngOnInit(): void {
    this.cargarPerfiles();
  }

  cargarPerfiles(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.perfilService.obtenerActividadPerfiles().subscribe({
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

  obtenerGrupoPrincipal(): ActividadPerfil | null {
    return this.gruposOrdenadosPorTotal()[0] ?? null;
  }

  obtenerGrupoMayorInactividad(): ActividadPerfil | null {
    return this.gruposOrdenadosPorInactividad()[0] ?? null;
  }

  formatearNumero(valor: number): string {
    return this.formatoNumero.format(valor);
  }

  formatearDecimal(valor: number): string {
    return this.formatoDecimal.format(valor);
  }

  obtenerPorcentajeGrupo(grupo: ActividadPerfil): string {
    const total = this.totalPerfilesAnalizados();

    if (total === 0) {
      return '0.00';
    }

    return this.formatearDecimal((grupo.totalPerfiles / total) * 100);
  }

  obtenerPorcentajeBarra(grupo: ActividadPerfil): number {
    const grupoPrincipal = this.obtenerGrupoPrincipal();

    if (!grupoPrincipal || grupoPrincipal.totalPerfiles === 0) {
      return 0;
    }

    return (grupo.totalPerfiles / grupoPrincipal.totalPerfiles) * 100;
  }

  obtenerColorGrupo(nivelActividad: string): string {
    const texto = this.normalizarTexto(nivelActividad);

    if (texto.includes('riesgo') || texto.includes('abandono') || texto.includes('inactivo')) {
      return 'danger';
    }

    if (texto.includes('media') || texto.includes('moderada')) {
      return 'warning';
    }

    if (texto.includes('activo') || texto.includes('alta')) {
      return 'success';
    }

    return 'medium';
  }

  obtenerVarianteGrupo(nivelActividad: string): 'normal' | 'positivo' | 'advertencia' | 'riesgo' {
    const texto = this.normalizarTexto(nivelActividad);

    if (texto.includes('riesgo') || texto.includes('abandono') || texto.includes('inactivo')) {
      return 'riesgo';
    }

    if (texto.includes('media') || texto.includes('moderada')) {
      return 'advertencia';
    }

    if (texto.includes('activo') || texto.includes('alta')) {
      return 'positivo';
    }

    return 'normal';
  }

  obtenerLecturaEjecutiva(): string {
    const grupoPrincipal = this.obtenerGrupoPrincipal();
    const grupoMayorInactividad = this.obtenerGrupoMayorInactividad();

    if (!grupoPrincipal || !grupoMayorInactividad) {
      return 'No hay información suficiente para generar una lectura ejecutiva de perfiles.';
    }

    return `El grupo con mayor cantidad de perfiles es "${grupoPrincipal.nivelActividad}", mientras que el grupo con mayor promedio de días sin actividad es "${grupoMayorInactividad.nivelActividad}". Esta información permite priorizar acciones de retención, reactivación y recomendaciones personalizadas.`;
  }

  private esGrupoCritico(nivelActividad: string): boolean {
    const texto = this.normalizarTexto(nivelActividad);

    return texto.includes('riesgo')
      || texto.includes('abandono')
      || texto.includes('inactivo');
  }

  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}