export interface OpcionesFiltro {
  anios: number[];
  paises: string[];
  continentes: string[];
  planes: string[];
  tiposContenido: string[];
  generos: string[];
  prioridadesMercado: string[];
  nivelesActividad: string[];
}

export interface FiltrosKpi {
  anio?: number | null;
  pais?: string | null;
  continente?: string | null;
  plan?: string | null;
  tipoContenido?: string | null;
  genero?: string | null;
  prioridadMercado?: string | null;
  nivelActividad?: string | null;
}