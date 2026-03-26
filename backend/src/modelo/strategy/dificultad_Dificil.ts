import type { strategy_Dificultad } from "./strategy_Dificultad";

export class dificultad_Dificil implements strategy_Dificultad {
  public calcular_puntaje(intentos: number): number {
    return 200 + intentos * 80;
  }

  public obtener_intentos_maximos(): number {
    return 6;
  }

  public obtener_rango_minimo(): number {
    return 1;
  }

  public obtener_rango_maximo(): number {
    return 12;
  }
}
