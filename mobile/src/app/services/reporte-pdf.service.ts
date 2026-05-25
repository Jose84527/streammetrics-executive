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
  async generarReporteEjecutivo(reporte: ResumenReporteEjecutivo): Promise<void> {
    const documento = this.crearDocumentoReporte(reporte);
    const nombreArchivo = `reporte-ejecutivo-streaming-${Date.now()}.pdf`;

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
      title: 'Reporte ejecutivo',
      text: 'Reporte ejecutivo generado desde Panel Ejecutivo Streaming.',
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

    const margenIzquierdo = 14;
    const anchoPagina = documento.internal.pageSize.getWidth();
    const fecha = this.formatearFecha(reporte.fechaGeneracion);

    let posicionY = 16;

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(18);
    documento.text('Reporte Ejecutivo de KPIs', margenIzquierdo, posicionY);

    posicionY += 8;

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);
    documento.text('Panel Ejecutivo Streaming', margenIzquierdo, posicionY);

    posicionY += 6;
    documento.text(`Fecha de generacion: ${fecha}`, margenIzquierdo, posicionY);

    posicionY += 10;

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);

    const introduccion = [
      'Este informe resume los principales indicadores de consumo, actividad y desempeno de una plataforma de streaming simulada.',
      'El objetivo es apoyar la toma de decisiones mediante hallazgos, debilidades detectadas y recomendaciones estrategicas.'
    ];

    posicionY = this.agregarParrafos(
      documento,
      introduccion,
      margenIzquierdo,
      posicionY,
      anchoPagina
    );

    posicionY += 4;

    autoTable(documento, {
      startY: posicionY,
      head: [['Indicador', 'Valor']],
      body: [
        ['Visualizaciones totales', this.formatearNumero(reporte.resumenGeneral.totalVisualizaciones)],
        ['Horas vistas', this.formatearDecimal(reporte.resumenGeneral.totalHorasVistas)],
        ['Perfiles analizados', this.formatearNumero(reporte.resumenGeneral.totalPerfilesAnalizados)],
        ['Genero mas visto', reporte.resumenGeneral.generoMasVisto],
        ['Pais con mayor consumo', reporte.resumenGeneral.paisMayorConsumo],
        ['Plan con mayor consumo', reporte.resumenGeneral.planMayorConsumo],
        ['Franja horaria principal', reporte.resumenGeneral.franjaHorariaMayorActividad]
      ],
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 98, 255],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: {
        left: margenIzquierdo,
        right: margenIzquierdo
      }
    });

    posicionY = this.obtenerYFinal(documento) + 10;

    posicionY = this.agregarSeccionItems(
      documento,
      'Hallazgos principales',
      reporte.hallazgosPrincipales,
      posicionY,
      margenIzquierdo
    );

    posicionY = this.agregarSeccionItems(
      documento,
      'Debilidades detectadas',
      reporte.debilidadesDetectadas,
      posicionY,
      margenIzquierdo
    );

    posicionY = this.agregarSeccionItems(
      documento,
      'Recomendaciones estrategicas',
      reporte.recomendaciones,
      posicionY,
      margenIzquierdo
    );

    posicionY = this.validarEspacio(documento, posicionY, 35);

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(13);
    documento.text('Conclusion ejecutiva', margenIzquierdo, posicionY);

    posicionY += 7;

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);

    const conclusion = `El analisis muestra que ${reporte.resumenGeneral.paisMayorConsumo} concentra el mayor consumo, el genero ${reporte.resumenGeneral.generoMasVisto} lidera la demanda y el plan ${reporte.resumenGeneral.planMayorConsumo} presenta el mayor nivel de actividad. Se recomienda priorizar acciones comerciales, recomendaciones personalizadas y estrategias de retencion en los segmentos con mayor oportunidad.`;

    this.agregarParrafos(
      documento,
      [conclusion],
      margenIzquierdo,
      posicionY,
      anchoPagina
    );

    this.agregarNumeracionPaginas(documento);

    return documento;
  }

  private agregarSeccionItems(
    documento: jsPDF,
    titulo: string,
    items: ItemEjecutivo[],
    posicionY: number,
    margenIzquierdo: number
  ): number {
    if (!items || items.length === 0) {
      return posicionY;
    }

    posicionY = this.validarEspacio(documento, posicionY, 40);

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(13);
    documento.text(titulo, margenIzquierdo, posicionY);

    posicionY += 5;

    autoTable(documento, {
      startY: posicionY,
      head: [['Nivel', 'Titulo', 'Descripcion']],
      body: items.map((item) => [
        this.limpiarTexto(item.nivel),
        this.limpiarTexto(item.titulo),
        this.limpiarTexto(item.descripcion)
      ]),
      styles: {
        fontSize: 8.2,
        cellPadding: 2.5,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [55, 65, 81],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { cellWidth: 23 },
        1: { cellWidth: 43 },
        2: { cellWidth: 100 }
      },
      margin: {
        left: margenIzquierdo,
        right: margenIzquierdo
      }
    });

    return this.obtenerYFinal(documento) + 10;
  }

  private agregarParrafos(
    documento: jsPDF,
    parrafos: string[],
    margenIzquierdo: number,
    posicionY: number,
    anchoPagina: number
  ): number {
    const anchoTexto = anchoPagina - margenIzquierdo * 2;

    for (const parrafo of parrafos) {
      const lineas = documento.splitTextToSize(
        this.limpiarTexto(parrafo),
        anchoTexto
      );

      documento.text(lineas, margenIzquierdo, posicionY);

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

    if (posicionY + espacioNecesario > altoPagina - 15) {
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
      documento.text(
        `Pagina ${pagina} de ${totalPaginas}`,
        anchoPagina / 2,
        altoPagina - 8,
        { align: 'center' }
      );
    }
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
    return new Intl.NumberFormat('es-MX').format(valor);
  }

  private formatearDecimal(valor: number): string {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }

  private limpiarTexto(texto: string): string {
    return (texto ?? '')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/–|—/g, '-');
  }
}