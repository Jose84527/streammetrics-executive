export interface ActividadPerfil {
  nivelActividad: string;
  totalPerfiles: number;
  promedioDiasSinActividad: number;
  accionSugerida: string;
}

export interface ResumenActividadPerfiles {
  actividadPerfiles: ActividadPerfil[];
}