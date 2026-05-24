export interface ConsumoPlan {
  nombre: string;
  visualizaciones: number;
  horasVistas: number;
}

export interface ResumenPlanes {
  planes: ConsumoPlan[];
}