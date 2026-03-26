import {
  dificultad_Normal,
  type strategy_Dificultad,
} from "./strategy";

type operacion_Extraida = {
  numeros: number[];
  resultado: number;
};

const TOTAL_NUMEROS_JUEGO = 4;

export class modelo_Juego {
  private Numeros: number[];
  private numero_Objetivo: number;
  private intentos_Jugador: number;
  private intentos_Maximos: number;
  private puntaje: number;
  private estatus_Juego: string;
  private Strategy: strategy_Dificultad;

  constructor(Strategy: strategy_Dificultad = new dificultad_Normal()) {
    this.Strategy = Strategy;
    this.Numeros = [];
    this.numero_Objetivo = 0;
    this.intentos_Jugador = 0;
    this.intentos_Maximos = this.Strategy.obtener_intentos_maximos();
    this.puntaje = 0;
    this.estatus_Juego = "pendiente";

    this.generar_Numeros();
    this.generar_Resultado();
  }

  public generar_Numeros(): number {
    const rango_Minimo = this.Strategy.obtener_rango_minimo();
    const rango_Maximo = this.Strategy.obtener_rango_maximo();
    const disponibles = Array.from(
      { length: rango_Maximo - rango_Minimo + 1 },
      (_valor, indice) => indice + rango_Minimo,
    );

    for (let indice = disponibles.length - 1; indice > 0; indice -= 1) {
      const indice_Aleatorio = Math.floor(Math.random() * (indice + 1));
      [disponibles[indice], disponibles[indice_Aleatorio]] = [
        disponibles[indice_Aleatorio],
        disponibles[indice],
      ];
    }

    this.Numeros = disponibles.slice(0, TOTAL_NUMEROS_JUEGO);
    this.estatus_Juego = "en_curso";

    return this.Numeros.length;
  }

  public generar_Resultado(): number {
    if (this.Numeros.length !== TOTAL_NUMEROS_JUEGO) {
      this.generar_Numeros();
    }

    const [primer_Numero, segundo_Numero, tercer_Numero, cuarto_Numero] =
      this.Numeros;

    this.numero_Objetivo =
      primer_Numero + segundo_Numero * tercer_Numero - cuarto_Numero;

    return this.numero_Objetivo;
  }

  public validar_respuesta(operacion: string): boolean {
    if (this.is_Terminado()) {
      return false;
    }

    const operacion_Validada = this.extraer_Operacion(operacion);
    this.intentos_Jugador += 1;

    const resultado_Correcto =
      operacion_Validada.resultado === this.numero_Objetivo;
    const numeros_Correctos =
      operacion_Validada.numeros.length === this.Numeros.length &&
      operacion_Validada.numeros.every(
        (numero, indice) => numero === this.Numeros[indice],
      );

    if (resultado_Correcto && numeros_Correctos) {
      this.estatus_Juego = "ganado";
      this.calcular_Puntaje(this.intentos_Maximos - this.intentos_Jugador);
      return true;
    }

    if (this.intentos_Jugador >= this.intentos_Maximos) {
      this.estatus_Juego = "perdido";
    }

    return false;
  }

  public validar_Operacion(operacion: string): number {
    return this.extraer_Operacion(operacion).resultado;
  }

  public calcular_Puntaje(intentos_Restantes: number): number {
    if (!Number.isInteger(intentos_Restantes) || intentos_Restantes < 0) {
      throw new Error("Los intentos restantes deben ser un entero no negativo.");
    }

    this.puntaje = this.Strategy.calcular_puntaje(intentos_Restantes);

    return this.puntaje;
  }

  public is_Terminado(): boolean {
    return (
      this.estatus_Juego === "ganado" ||
      this.estatus_Juego === "perdido" ||
      this.intentos_Jugador >= this.intentos_Maximos
    );
  }

  public reiniciar(): void {
    this.intentos_Jugador = 0;
    this.puntaje = 0;
    this.intentos_Maximos = this.Strategy.obtener_intentos_maximos();
    this.estatus_Juego = "pendiente";
    this.generar_Numeros();
    this.generar_Resultado();
  }

  public get_Numeros(): number[] {
    return [...this.Numeros];
  }

  public get_numero_Objetivo(): number {
    return this.numero_Objetivo;
  }

  public get_intentos_Jugador(): number {
    return this.intentos_Jugador;
  }

  public get_intentos_Maximos(): number {
    return this.intentos_Maximos;
  }

  public get_intentos_Restantes(): number {
    return Math.max(this.intentos_Maximos - this.intentos_Jugador, 0);
  }

  public get_puntaje(): number {
    return this.puntaje;
  }

  public get_estatus_Juego(): string {
    return this.estatus_Juego;
  }

  public get_rango_Minimo(): number {
    return this.Strategy.obtener_rango_minimo();
  }

  public get_rango_Maximo(): number {
    return this.Strategy.obtener_rango_maximo();
  }

  public get_expresion_Juego(): string {
    return `${this.Numeros[0]}+${this.Numeros[1]}*${this.Numeros[2]}-${this.Numeros[3]}`;
  }

  private extraer_Operacion(operacion: string): operacion_Extraida {
    const operacion_Normalizada = operacion
      .replace(/\s+/g, "")
      .replace(/[xX]/g, "*");
    const coincidencias = operacion_Normalizada.match(
      /^(\d+)\+(\d+)\*(\d+)-(\d+)$/,
    );

    if (!coincidencias) {
      throw new Error(
        "La operacion debe tener el formato numero+numero*numero-numero.",
      );
    }

    const numeros = coincidencias.slice(1).map((valor) => Number(valor));
    const rango_Minimo = this.Strategy.obtener_rango_minimo();
    const rango_Maximo = this.Strategy.obtener_rango_maximo();

    if (
      numeros.some(
        (numero) => numero < rango_Minimo || numero > rango_Maximo,
      )
    ) {
      throw new Error(
        `Los numeros deben estar entre ${rango_Minimo} y ${rango_Maximo}.`,
      );
    }

    if (new Set(numeros).size !== numeros.length) {
      throw new Error("La operacion no debe repetir numeros.");
    }

    const resultado = numeros[0] + numeros[1] * numeros[2] - numeros[3];

    return { numeros, resultado };
  }
}
