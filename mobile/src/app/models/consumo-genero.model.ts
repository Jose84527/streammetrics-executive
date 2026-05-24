export interface ConsumoGenero {
  nombre: string;
  visualizaciones: number;
  horasVistas: number;
}

export interface ResumenConsumoGeneros {
  generosPorVisualizaciones: ConsumoGenero[];
  generosPorHorasVistas: ConsumoGenero[];
}