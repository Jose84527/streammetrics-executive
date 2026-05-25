export interface ConfiguracionServidor {
  ip: string;
  puerto: string;
  baseUrl: string;
}

export interface ResultadoConexionServidor {
  exitoso: boolean;
  mensaje: string;
}