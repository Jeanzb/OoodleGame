export interface strategy_Dificultad {
  calcular_puntaje(intentos: number): number;
  obtener_intentos_maximos(): number;
  obtener_rango_minimo(): number;
  obtener_rango_maximo(): number;
}
