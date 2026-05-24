export interface ConsumoMercado {
  nombre: string;
  visualizaciones: number;
  horasVistas: number;
}

export interface ResumenMercados {
  paisesMayorConsumo: ConsumoMercado[];
  continentesMayorConsumo: ConsumoMercado[];
}