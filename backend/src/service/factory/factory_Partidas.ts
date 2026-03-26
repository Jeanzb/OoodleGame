import { modelo_Juego } from "../../modelo";
import {
  dificultad_Dificil,
  dificultad_Normal,
  type strategy_Dificultad,
} from "../../modelo/strategy";

export class factory_Partidas {
  public static crear_Partida(dificultad: string): modelo_Juego {
    const estrategia = factory_Partidas.crear_Estrategia(dificultad);

    return new modelo_Juego(estrategia);
  }

  private static crear_Estrategia(dificultad: string): strategy_Dificultad {
    if (dificultad.toLowerCase() === "dificil") {
      return new dificultad_Dificil();
    }

    return new dificultad_Normal();
  }
}
