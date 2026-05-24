export type EstadoCumplimiento = 'ALTO' | 'MEDIO' | 'BAJO' | 'SIN_META';

export interface CumplimientoMeta {
  pais: string;
  visualizacionesReales: number;
  metaVisualizaciones: number;
  porcentajeCumplimientoVisualizaciones: number;
  horasReales: number;
  metaHoras: number;
  porcentajeCumplimientoHoras: number;
  estado: EstadoCumplimiento;
}

export interface ResumenCumplimientoMetas {
  cumplimientoPorPais: CumplimientoMeta[];
}