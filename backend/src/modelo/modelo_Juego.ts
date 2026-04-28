import { Jugador } from "./modelo_Jugador";
import { StrategyDificultad } from "./strategy/strategy_Dificultad";

export class Partida {
  private jugador: Jugador;
  private strategy: StrategyDificultad;
  private numerosObjetivo: number[];
  private intentosMaximos: number;
  private puntaje: number;
  private estado: string;
  private intentosJugador: number;

  constructor(jugador: Jugador, strategy: StrategyDificultad) {
    this.jugador = jugador;
    this.strategy = strategy;
    this.numerosObjetivo = [];
    this.intentosMaximos = this.strategy.calcularIntentosMaximos();
    this.puntaje = 0;
    this.estado = "pendiente";
    this.intentosJugador = 0;
  }

  public iniciarJuego(): void {
    this.intentosJugador = 0;
    this.puntaje = 0;
    this.estado = "en_curso";
    this.generarNumeros();
  }

  public generarNumeros(): void {
    this.numerosObjetivo = this.strategy.generarNumeros();
  }

  public validarOperacion(operacion: string): boolean {
    if (this.esTerminado()) {
      return false;
    }

    const operacionNormalizada = operacion
      .replace(/\s+/g, "")
      .replace(/[xX]/g, "*");
    const coincidencias = operacionNormalizada.match(
      /^(\d+)\+(\d+)\*(\d+)-(\d+)$/,
    );

    if (!coincidencias) {
      throw new Error(
        "La operacion debe tener el formato numero+numero*numero-numero.",
      );
    }

    const numeros = coincidencias.slice(1).map((v) => Number(v));
    const numsGenerados = this.numerosObjetivo;

    if (numeros.length !== numsGenerados.length) {
      throw new Error("La operacion debe contener 4 numeros.");
    }

    const sortedJugador = [...numeros].sort((a, b) => a - b);
    const sortedGenerados = [...numsGenerados].sort((a, b) => a - b);
    const numerosCorrectos = sortedJugador.every(
      (n, i) => n === sortedGenerados[i],
    );

    const resultado =
      numeros[0] + numeros[1] * numeros[2] - numeros[3];
    const numeroObjetivo =
      numsGenerados[0] +
      numsGenerados[1] * numsGenerados[2] -
      numsGenerados[3];

    this.intentosJugador += 1;

    if (resultado === numeroObjetivo && numerosCorrectos) {
      this.estado = "ganado";
      this.calcularPuntaje();
      return true;
    }

    if (this.intentosJugador >= this.intentosMaximos) {
      this.estado = "perdido";
    }

    return false;
  }

  public calcularPuntaje(): number {
    this.puntaje = this.strategy.calcularPuntaje(this.intentosJugador);
    return this.puntaje;
  }

  public esTerminado(): boolean {
    return (
      this.estado === "ganado" ||
      this.estado === "perdido" ||
      this.intentosJugador >= this.intentosMaximos
    );
  }

  public finalizarPartida(): void {
    if (!this.esTerminado()) {
      this.estado = "finalizado";
    }
  }

  public getPuntaje(): number {
    return this.puntaje;
  }

  public getJugador(): Jugador {
    return this.jugador;
  }

  public getNumerosObjetivo(): number[] {
    return [...this.numerosObjetivo];
  }

  public getIntentosMaximos(): number {
    return this.intentosMaximos;
  }

  public getIntentosJugador(): number {
    return this.intentosJugador;
  }

  public getEstado(): string {
    return this.estado;
  }

  public getNumeroObjetivo(): number {
    if (this.numerosObjetivo.length === 0) return 0;
    const [a, b, c, d] = this.numerosObjetivo;
    return a + b * c - d;
  }

  public getExpresionJuego(): string {
    if (this.numerosObjetivo.length === 0) return "";
    const [a, b, c, d] = this.numerosObjetivo;
    return `${a}+${b}*${c}-${d}`;
  }
}
