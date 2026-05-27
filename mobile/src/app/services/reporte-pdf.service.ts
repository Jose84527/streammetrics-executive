import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  ItemEjecutivo,
  ResumenReporteEjecutivo
} from '../models/reporte-ejecutivo.model';

@Injectable({
  providedIn: 'root'
})
export class ReportePdfService {
  private readonly margenIzquierdo = 14;
  private readonly margenDerecho = 14;
  private readonly colorPrimario: [number, number, number] = [41, 98, 255];
  private readonly colorOscuro: [number, number, number] = [31, 41, 55];
  private readonly colorSuave: [number, number, number] = [245, 247, 250];

  async generarReporteEjecutivo(reporte: ResumenReporteEjecutivo): Promise<void> {
    const documento = this.crearDocumentoReporte(reporte);
    const nombreArchivo = `reporte-ejecutivo-streammetrics-${Date.now()}.pdf`;

    if (Capacitor.isNativePlatform()) {
      await this.guardarYCompartirPdfEnDispositivo(documento, nombreArchivo);
      return;
    }

    documento.save(nombreArchivo);
  }

  private async guardarYCompartirPdfEnDispositivo(
    documento: jsPDF,
    nombreArchivo: string
  ): Promise<void> {
    const dataUri = documento.output('datauristring');
    const base64 = dataUri.split(',')[1];

    await Filesystem.writeFile({
      path: nombreArchivo,
      data: base64,
      directory: Directory.Cache
    });

    const archivo = await Filesystem.getUri({
      path: nombreArchivo,
      directory: Directory.Cache
    });

    await Share.share({
      title: 'Reporte ejecutivo StreamMetrics',
      text: 'Reporte ejecutivo generado desde StreamMetrics Executive.',
      url: archivo.uri,
      dialogTitle: 'Compartir reporte PDF'
    });
  }

  private crearDocumentoReporte(reporte: ResumenReporteEjecutivo): jsPDF {
    const documento = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const anchoPagina = documento.internal.pageSize.getWidth();
    let posicionY = 16;

    posicionY = this.agregarPortada(documento, reporte, posicionY);
    posicionY = this.agregarResumenEjecutivo(documento, reporte, posicionY, anchoPagina);
    posicionY = this.agregarKpisPrincipales(documento, reporte, posicionY);
    posicionY = this.agregarInterpretacionKpis(documento, reporte, posicionY);
    posicionY = this.agregarMetodologia(documento, posicionY);
    posicionY = this.agregarSeccionItems(
      documento,
      'Hallazgos principales',
      'Elementos destacados detectados por el backend a partir de los KPIs generales del sistema.',
      reporte.hallazgosPrincipales,
      posicionY
    );
    posicionY = this.agregarSeccionItems(
      documento,
      'Debilidades detectadas',
      'Riesgos, brechas u oportunidades de mejora identificadas con base en los indicadores calculados.',
      reporte.debilidadesDetectadas,
      posicionY
    );
    posicionY = this.agregarSeccionItems(
      documento,
      'Recomendaciones estrategicas',
      'Acciones sugeridas por reglas de negocio aplicadas sobre los resultados de los KPIs.',
      reporte.recomendaciones,
      posicionY
    );
    this.agregarConclusionEjecutiva(documento, reporte, posicionY, anchoPagina);
    this.agregarNumeracionPaginas(documento);

    return documento;
  }

  private agregarPortada(
    documento: jsPDF,
    reporte: ResumenReporteEjecutivo,
    posicionY: number
  ): number {
    documento.setFillColor(...this.colorPrimario);
    documento.rect(0, 0, documento.internal.pageSize.getWidth(), 34, 'F');

    documento.setTextColor(255, 255, 255);
    documento.setFont('helvetica', 'bold');
    documento.setFontSize(18);
    documento.text('Reporte Ejecutivo de KPIs', this.margenIzquierdo, 15);

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);
    documento.text('StreamMetrics Executive - Panorama general del sistema', this.margenIzquierdo, 23);

    documento.setTextColor(0, 0, 0);
    posicionY = 44;

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(13);
    documento.text(this.limpiarTexto(reporte.titulo), this.margenIzquierdo, posicionY);

    posicionY += 7;

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);
    documento.text(`Fecha de generacion: ${this.formatearFecha(reporte.fechaGeneracion)}`, this.margenIzquierdo, posicionY);

    posicionY += 8;

    documento.setFontSize(9.5);
    const descripcion = [
      'Este documento resume los indicadores principales de una plataforma de streaming simulada.',
      'El reporte no corresponde a un estado financiero contable; funciona como un informe ejecutivo de desempeno basado en KPIs.',
      'Las observaciones y recomendaciones se generan automaticamente desde el backend mediante reglas de negocio aplicadas sobre los indicadores calculados.'
    ];

    return this.agregarParrafos(documento, descripcion, posicionY) + 3;
  }

  private agregarResumenEjecutivo(
    documento: jsPDF,
    reporte: ResumenReporteEjecutivo,
    posicionY: number,
    anchoPagina: number
  ): number {
    posicionY = this.validarEspacio(documento, posicionY, 36);

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(13);
    documento.text('Resumen ejecutivo', this.margenIzquierdo, posicionY);

    posicionY += 7;

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);

    const resumen = [
      `El sistema registro ${this.formatearNumero(reporte.resumenGeneral.totalVisualizaciones)} visualizaciones y ${this.formatearDecimal(reporte.resumenGeneral.totalHorasVistas)} horas vistas dentro del panorama general analizado.`,
      `El mercado con mayor consumo es ${this.valorSeguro(reporte.resumenGeneral.paisMayorConsumo)}, el genero dominante es ${this.valorSeguro(reporte.resumenGeneral.generoMasVisto)} y el plan con mayor actividad es ${this.valorSeguro(reporte.resumenGeneral.planMayorConsumo)}.`,
      `La franja horaria con mayor actividad es ${this.valorSeguro(reporte.resumenGeneral.franjaHorariaMayorActividad)}, por lo que puede utilizarse como referencia para estrategias de comunicacion, estrenos o recomendaciones.`
    ];

    posicionY = this.agregarParrafos(documento, resumen, posicionY);

    autoTable(documento, {
      startY: posicionY + 2,
      body: [
        ['Alcance', 'Panorama general del sistema'],
        ['Base analizada', `${this.formatearNumero(reporte.resumenGeneral.totalPerfilesAnalizados)} perfiles`],
        ['Tipo de reporte', 'Ejecutivo de KPIs y toma de decisiones'],
        ['Generacion de recomendaciones', 'Automatica, mediante reglas de negocio en backend']
      ],
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 55 },
        1: { cellWidth: anchoPagina - this.margenIzquierdo - this.margenDerecho - 55 }
      },
      alternateRowStyles: {
        fillColor: this.colorSuave
      },
      margin: {
        left: this.margenIzquierdo,
        right: this.margenDerecho
      }
    });

    return this.obtenerYFinal(documento) + 10;
  }

  private agregarKpisPrincipales(
    documento: jsPDF,
    reporte: ResumenReporteEjecutivo,
    posicionY: number
  ): number {
    posicionY = this.validarEspacio(documento, posicionY, 55);

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(13);
    documento.text('KPIs principales del sistema', this.margenIzquierdo, posicionY);

    posicionY += 5;

    autoTable(documento, {
      startY: posicionY,
      head: [['KPI', 'Valor', 'Origen / interpretacion']],
      body: [
        [
          'Visualizaciones totales',
          this.formatearNumero(reporte.resumenGeneral.totalVisualizaciones),
          'Suma de reproducciones registradas en la tabla analitica.'
        ],
        [
          'Horas vistas',
          this.formatearDecimal(reporte.resumenGeneral.totalHorasVistas),
          'Tiempo total de consumo acumulado por los usuarios.'
        ],
        [
          'Perfiles analizados',
          this.formatearNumero(reporte.resumenGeneral.totalPerfilesAnalizados),
          'Base de perfiles considerados para medir actividad e inactividad.'
        ],
        [
          'Genero dominante',
          this.valorSeguro(reporte.resumenGeneral.generoMasVisto),
          'Genero con mayor consumo dentro del panorama general.'
        ],
        [
          'Pais con mayor consumo',
          this.valorSeguro(reporte.resumenGeneral.paisMayorConsumo),
          'Mercado que concentra mayor volumen de visualizaciones.'
        ],
        [
          'Plan con mayor consumo',
          this.valorSeguro(reporte.resumenGeneral.planMayorConsumo),
          'Plan de suscripcion con mayor actividad registrada.'
        ],
        [
          'Franja horaria principal',
          this.valorSeguro(reporte.resumenGeneral.franjaHorariaMayorActividad),
          'Horario con mayor concentracion de actividad.'
        ]
      ],
      styles: {
        fontSize: 8.5,
        cellPadding: 2.6,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: this.colorPrimario,
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: this.colorSuave
      },
      columnStyles: {
        0: { cellWidth: 43, fontStyle: 'bold' },
        1: { cellWidth: 38 },
        2: { cellWidth: 95 }
      },
      margin: {
        left: this.margenIzquierdo,
        right: this.margenDerecho
      }
    });

    return this.obtenerYFinal(documento) + 10;
  }

  private agregarInterpretacionKpis(
    documento: jsPDF,
    reporte: ResumenReporteEjecutivo,
    posicionY: number
  ): number {
    posicionY = this.validarEspacio(documento, posicionY, 45);

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(13);
    documento.text('Lectura de los indicadores', this.margenIzquierdo, posicionY);

    posicionY += 7;

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);

    const lectura = [
      `El volumen de visualizaciones permite identificar la magnitud del consumo general. En este caso, el sistema concentra ${this.formatearNumero(reporte.resumenGeneral.totalVisualizaciones)} reproducciones.`,
      `Las horas vistas complementan la lectura anterior porque muestran tiempo real de consumo, no solo cantidad de reproducciones. El total registrado es de ${this.formatearDecimal(reporte.resumenGeneral.totalHorasVistas)} horas.`,
      `El pais, genero y plan lider no son valores escritos manualmente; provienen de consultas de agrupacion sobre los datos procesados por el backend.`,
      `La franja horaria principal sirve como referencia operativa para decidir en que momento conviene programar campanias, estrenos o recomendaciones.`
    ];

    return this.agregarParrafos(documento, lectura, posicionY) + 4;
  }

  private agregarMetodologia(
    documento: jsPDF,
    posicionY: number
  ): number {
    posicionY = this.validarEspacio(documento, posicionY, 55);

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(13);
    documento.text('Criterio de generacion del reporte', this.margenIzquierdo, posicionY);

    posicionY += 5;

    autoTable(documento, {
      startY: posicionY,
      head: [['Seccion', 'Como se genera']],
      body: [
        [
          'Hallazgos principales',
          'Se toman los KPIs con mejor posicion: genero dominante, mercado principal, plan lider y contenidos destacados.'
        ],
        [
          'Debilidades detectadas',
          'Se identifican brechas frente a metas, perfiles en riesgo o inactivos y contenidos con baja finalizacion cuando existan.'
        ],
        [
          'Recomendaciones',
          'Se construyen con reglas de negocio: reforzar lo que tiene alto consumo, atender mercados con bajo cumplimiento y reactivar perfiles en riesgo.'
        ],
        [
          'Conclusiones',
          'Se redactan a partir de los KPIs principales y no como texto fijo independiente de los datos.'
        ]
      ],
      styles: {
        fontSize: 8.7,
        cellPadding: 2.8,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: this.colorOscuro,
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: this.colorSuave
      },
      columnStyles: {
        0: { cellWidth: 48, fontStyle: 'bold' },
        1: { cellWidth: 128 }
      },
      margin: {
        left: this.margenIzquierdo,
        right: this.margenDerecho
      }
    });

    return this.obtenerYFinal(documento) + 10;
  }

  private agregarSeccionItems(
    documento: jsPDF,
    titulo: string,
    descripcion: string,
    items: ItemEjecutivo[],
    posicionY: number
  ): number {
    if (!items || items.length === 0) {
      return posicionY;
    }

    posicionY = this.validarEspacio(documento, posicionY, 45);

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(13);
    documento.text(titulo, this.margenIzquierdo, posicionY);

    posicionY += 6;

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(9.5);
    posicionY = this.agregarParrafos(documento, [descripcion], posicionY);

    autoTable(documento, {
      startY: posicionY,
      head: [['Nivel', 'Indicador / regla', 'Descripcion basada en datos']],
      body: items.map((item) => [
        this.limpiarTexto(this.obtenerNivelLegible(item.nivel)),
        this.limpiarTexto(item.titulo),
        this.limpiarTexto(item.descripcion)
      ]),
      styles: {
        fontSize: 8.2,
        cellPadding: 2.5,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: this.colorOscuro,
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: this.colorSuave
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 45, fontStyle: 'bold' },
        2: { cellWidth: 106 }
      },
      margin: {
        left: this.margenIzquierdo,
        right: this.margenDerecho
      }
    });

    return this.obtenerYFinal(documento) + 10;
  }

  private agregarConclusionEjecutiva(
    documento: jsPDF,
    reporte: ResumenReporteEjecutivo,
    posicionY: number,
    anchoPagina: number
  ): void {
    posicionY = this.validarEspacio(documento, posicionY, 45);

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(13);
    documento.text('Conclusion ejecutiva', this.margenIzquierdo, posicionY);

    posicionY += 7;

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);

    const conclusion = [
      `El panorama general muestra que ${this.valorSeguro(reporte.resumenGeneral.paisMayorConsumo)} es el mercado con mayor consumo, ${this.valorSeguro(reporte.resumenGeneral.generoMasVisto)} es el genero dominante y ${this.valorSeguro(reporte.resumenGeneral.planMayorConsumo)} es el plan con mayor actividad.`,
      `Estos resultados permiten orientar decisiones comerciales y de producto hacia los segmentos con mayor respuesta, sin perder de vista las debilidades detectadas en metas, perfiles o finalizacion de contenidos.`,
      `Las recomendaciones incluidas en el reporte se derivan de reglas de negocio aplicadas a los KPIs: fortalecer segmentos de alto consumo, atender mercados con bajo cumplimiento y activar estrategias de retencion en perfiles con riesgo de inactividad.`
    ];

    this.agregarParrafos(documento, conclusion, posicionY, anchoPagina);
  }

  private agregarParrafos(
    documento: jsPDF,
    parrafos: string[],
    posicionY: number,
    anchoPagina?: number
  ): number {
    const anchoDisponible =
      (anchoPagina ?? documento.internal.pageSize.getWidth()) -
      this.margenIzquierdo -
      this.margenDerecho;

    for (const parrafo of parrafos) {
      posicionY = this.validarEspacio(documento, posicionY, 20);

      const lineas = documento.splitTextToSize(
        this.limpiarTexto(parrafo),
        anchoDisponible
      );

      documento.text(lineas, this.margenIzquierdo, posicionY);
      posicionY += lineas.length * 5 + 3;
    }

    return posicionY;
  }

  private validarEspacio(
    documento: jsPDF,
    posicionY: number,
    espacioNecesario: number
  ): number {
    const altoPagina = documento.internal.pageSize.getHeight();

    if (posicionY + espacioNecesario > altoPagina - 17) {
      documento.addPage();
      return 16;
    }

    return posicionY;
  }

  private obtenerYFinal(documento: jsPDF): number {
    const documentoConTabla = documento as jsPDF & {
      lastAutoTable?: {
        finalY: number;
      };
    };

    return documentoConTabla.lastAutoTable?.finalY ?? 20;
  }

  private agregarNumeracionPaginas(documento: jsPDF): void {
    const totalPaginas = documento.getNumberOfPages();
    const anchoPagina = documento.internal.pageSize.getWidth();
    const altoPagina = documento.internal.pageSize.getHeight();

    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
      documento.setPage(pagina);

      documento.setFont('helvetica', 'normal');
      documento.setFontSize(8);
      documento.setTextColor(110, 110, 110);

      documento.text(
        `Pagina ${pagina} de ${totalPaginas}`,
        anchoPagina / 2,
        altoPagina - 8,
        { align: 'center' }
      );

      documento.text(
        'StreamMetrics Executive',
        this.margenIzquierdo,
        altoPagina - 8
      );
    }

    documento.setTextColor(0, 0, 0);
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(fecha));
  }

  private formatearNumero(valor: number): string {
    return new Intl.NumberFormat('es-MX').format(valor ?? 0);
  }

  private formatearDecimal(valor: number): string {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor ?? 0);
  }

  private obtenerNivelLegible(nivel: string): string {
    if (!nivel) {
      return 'INFO';
    }

    return nivel.replace(/_/g, ' ');
  }

  private valorSeguro(valor: string | number | null | undefined): string {
    if (valor === null || valor === undefined || valor === '') {
      return 'No disponible';
    }

    return String(valor);
  }

  private limpiarTexto(texto: string): string {
    return (texto ?? '')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/–|—/g, '-')
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u')
      .replace(/Á/g, 'A')
      .replace(/É/g, 'E')
      .replace(/Í/g, 'I')
      .replace(/Ó/g, 'O')
      .replace(/Ú/g, 'U')
      .replace(/ñ/g, 'n')
      .replace(/Ñ/g, 'N');
  }
}