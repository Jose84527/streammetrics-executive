export interface DesempenoContenido {
  titulo: string;
  tipoContenido: string;
  visualizaciones: number;
  horasVistas: number;
  calificacionPromedio: number;
  totalValoraciones: number;
  tasaFinalizacion: number;
}

export interface ResumenDesempenoContenidos {
  contenidosMasVistos: DesempenoContenido[];
  contenidosMejorCalificados: DesempenoContenido[];
  contenidosMayorFinalizacion: DesempenoContenido[];
}