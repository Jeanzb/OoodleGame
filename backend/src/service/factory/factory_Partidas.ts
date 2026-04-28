import { Partida } from "../../modelo/modelo_Juego";
import { Jugador } from "../../modelo/modelo_Jugador";
import { DificultadNormal } from "../../modelo/strategy/dificultad_Normal";
import { DificultadDificil } from "../../modelo/strategy/dificultad_Dificil";
import { StrategyDificultad } from "../../modelo/strategy/strategy_Dificultad";

export type TipoDificultad = "normal" | "dificil";

export class FactoryPartida {
  public static crearPartida(
    dificultad: TipoDificultad,
    jugador: Jugador,
  ): Partida {
    const estrategia = FactoryPartida.crearEstrategia(dificultad);
    const partida = new Partida(jugador, estrategia);
    partida.iniciarJuego();
    return partida;
  }

  private static crearEstrategia(dificultad: TipoDificultad): StrategyDificultad {
    if (dificultad === "dificil") {
      return new DificultadDificil();
    }
    return new DificultadNormal();
  }
}
