export interface CumplimientoMeta {
  pais: string;
  visualizacionesReales: number;
  metaVisualizaciones: number;
  porcentajeCumplimientoVisualizaciones: number;
  horasReales: number;
  metaHoras: number;
  porcentajeCumplimientoHoras: number;
  estado: string;
}

export interface ResumenCumplimientoMetas {
  cumplimientoPorPais: CumplimientoMeta[];
}