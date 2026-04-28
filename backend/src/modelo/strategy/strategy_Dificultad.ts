export interface StrategyDificultad {
  generarNumeros(): number[];
  calcularIntentosMaximos(): number;
  calcularPuntaje(intentosJugador: number): number;
}
