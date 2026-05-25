import { ResumenDashboard } from './resumen-dashboard.model';

export interface ItemEjecutivo {
  titulo: string;
  descripcion: string;
  nivel: string;
}

export interface ResumenReporteEjecutivo {
  titulo: string;
  fechaGeneracion: string;
  resumenGeneral: ResumenDashboard;
  hallazgosPrincipales: ItemEjecutivo[];
  debilidadesDetectadas: ItemEjecutivo[];
  recomendaciones: ItemEjecutivo[];
}