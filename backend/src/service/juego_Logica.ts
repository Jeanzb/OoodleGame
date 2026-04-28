import { PartidaDAO } from "./dao/partida_DAO";
import { JugadorDAO } from "./dao/usuario_DAO";
import { FactoryPartida, type TipoDificultad } from "./factory/factory_Partidas";
import { Partida } from "../modelo/modelo_Juego";
import { Jugador } from "../modelo/modelo_Jugador";
import { SingletonSupabase } from "./singleton_Supabase";

type estado_Publico_Juego = {
  id_Jugador: number;
  nombre_Jugador: string;
  dificultad: TipoDificultad;
  ecuacion_Generada: string;
  numero_Objetivo: number;
  intentos_Jugador: number;
  intentos_Maximos: number;
  intentos_Restantes: number;
  puntaje_Actual: number;
  puntaje_Jugador: number;
  estatus_Juego: string;
  rango_Minimo: number;
  rango_Maximo: number;
  total_Numeros: number;
  solucion?: number[];
};

type respuesta_Validacion = estado_Publico_Juego & {
  operacion_Validada: string;
  resultado_Operacion: number;
  es_Correcta: boolean;
  retroalimentacion: string[];
};

export class juego_Logica {
  private partida: Partida | null;
  private jugador: Jugador | null;
  private singletonSupabase: SingletonSupabase;
  private partidaDAO: PartidaDAO;
  private jugadorDAO: JugadorDAO;
  private score_Guardado: boolean;
  private dificultad_Actual: TipoDificultad;

  constructor() {
    this.partida = null;
    this.jugador = null;
    this.singletonSupabase = SingletonSupabase.getInstance();
    this.partidaDAO = new PartidaDAO();
    this.jugadorDAO = new JugadorDAO();
    this.score_Guardado = false;
    this.dificultad_Actual = "normal";
  }

  public iniciar_Juego(
    nombre_Jugador: string,
    dificultad: string = "normal",
  ): void {
    const nombre_Normalizado = nombre_Jugador.trim();
    const dificultad_Normalizada = this.normalizar_Dificultad(dificultad);

    if (!nombre_Normalizado) {
      throw new Error("Debes enviar un nombre de jugador valido.");
    }

    this.jugador = new Jugador(Date.now(), nombre_Normalizado, 0);
    this.dificultad_Actual = dificultad_Normalizada;
    this.partida = FactoryPartida.crearPartida(
      dificultad_Normalizada,
      this.jugador,
    );
    this.score_Guardado = false;
  }

  public generar_Round(): void {
    this.obtener_Jugador_Activo();
    this.partida = FactoryPartida.crearPartida(
      this.dificultad_Actual,
      this.jugador!,
    );
    this.score_Guardado = false;
  }

  public validar_Operacion_Jugador(operacion: string): string {
    const partida_Actual = this.obtener_Partida_Activa();
    const operacion_Normalizada = this.normalizar_Operacion(operacion);
    const numeros_Jugador = this.extraer_Numeros_Operacion(operacion_Normalizada);
    const numeros_Secretos = partida_Actual.getNumerosObjetivo();
    const resultado_Operacion =
      this.calcular_Resultado_Operacion(operacion_Normalizada);
    const es_Correcta = partida_Actual.validarOperacion(operacion_Normalizada);

    if (es_Correcta) {
      this.actualizar_Score();
    }

    const respuesta: respuesta_Validacion = {
      ...this.obtener_Estado_Publico(),
      operacion_Validada: operacion_Normalizada,
      resultado_Operacion,
      es_Correcta,
      retroalimentacion: this.construir_Retroalimentacion(
        numeros_Jugador,
        numeros_Secretos,
      ),
    };

    if (partida_Actual.esTerminado()) {
      respuesta.solucion = numeros_Secretos;
    }

    return JSON.stringify(respuesta);
  }

  public actualizar_Score(): void {
    const partida_Actual = this.obtener_Partida_Activa();
    const jugador_Actual = this.obtener_Jugador_Activo();
    const puntaje_Actual =
      partida_Actual.getEstado() === "ganado"
        ? partida_Actual.getPuntaje()
        : 0;
    jugador_Actual.sumarPuntaje(puntaje_Actual);
  }

  public async guardar_Score(): Promise<void> {
    const partida_Actual = this.obtener_Partida_Activa();
    const jugador_Actual = this.obtener_Jugador_Activo();

    if (!partida_Actual.esTerminado()) {
      throw new Error("El juego debe terminar antes de guardar el puntaje.");
    }

    if (this.score_Guardado) {
      return;
    }

    this.actualizar_Score();

    await this.jugadorDAO.create(jugador_Actual);
    await this.partidaDAO.create(partida_Actual);

    this.score_Guardado = true;
  }

  public async get_ranking(): Promise<string> {
    const ranking = await this.partidaDAO.obtenerRankingPartidas();
    return JSON.stringify(ranking);
  }

  public obtener_Estado_Publico(): estado_Publico_Juego {
    const partida_Actual = this.obtener_Partida_Activa();
    const jugador_Actual = this.obtener_Jugador_Activo();

    const estado_Publico: estado_Publico_Juego = {
      id_Jugador: jugador_Actual.getIdJugador(),
      nombre_Jugador: jugador_Actual.getNombre(),
      dificultad: this.dificultad_Actual,
      ecuacion_Generada: "A+B*C-D",
      numero_Objetivo: partida_Actual.getNumeroObjetivo(),
      intentos_Jugador: partida_Actual.getIntentosJugador(),
      intentos_Maximos: partida_Actual.getIntentosMaximos(),
      intentos_Restantes: Math.max(
        partida_Actual.getIntentosMaximos() -
          partida_Actual.getIntentosJugador(),
        0,
      ),
      puntaje_Actual: partida_Actual.getPuntaje(),
      puntaje_Jugador: jugador_Actual.getPuntajeTotal(),
      estatus_Juego: partida_Actual.getEstado(),
      rango_Minimo: 1,
      rango_Maximo: this.dificultad_Actual === "dificil" ? 12 : 9,
      total_Numeros: partida_Actual.getNumerosObjetivo().length,
    };

    if (partida_Actual.esTerminado()) {
      estado_Publico.solucion = partida_Actual.getNumerosObjetivo();
    }

    return estado_Publico;
  }

  private obtener_Partida_Activa(): Partida {
    if (this.partida === null) {
      throw new Error("Primero debes iniciar el juego.");
    }
    return this.partida;
  }

  private obtener_Jugador_Activo(): Jugador {
    if (this.jugador === null) {
      throw new Error("Primero debes iniciar el juego con un jugador.");
    }
    return this.jugador;
  }

  private normalizar_Dificultad(dificultad: string): TipoDificultad {
    return dificultad.toLowerCase() === "dificil" ? "dificil" : "normal";
  }

  private normalizar_Operacion(operacion: string): string {
    return operacion.replace(/\s+/g, "").replace(/[xX]/g, "*");
  }

  private extraer_Numeros_Operacion(operacion: string): number[] {
    const coincidencias = operacion.match(/^(\d+)\+(\d+)\*(\d+)-(\d+)$/);
    if (!coincidencias) {
      throw new Error(
        "La operacion debe tener el formato numero+numero*numero-numero.",
      );
    }
    return coincidencias.slice(1).map((v) => Number(v));
  }

  private calcular_Resultado_Operacion(operacion: string): number {
    const nums = this.extraer_Numeros_Operacion(operacion);
    return nums[0] + nums[1] * nums[2] - nums[3];
  }

  private construir_Retroalimentacion(
    numeros_Jugador: number[],
    numeros_Secretos: number[],
  ): string[] {
    const retroalimentacion = Array.from(
      { length: numeros_Jugador.length },
      () => "gris",
    );
    const posiciones_Usadas = Array.from(
      { length: numeros_Secretos.length },
      () => false,
    );

    for (let i = 0; i < numeros_Jugador.length; i++) {
      if (numeros_Jugador[i] === numeros_Secretos[i]) {
        retroalimentacion[i] = "verde";
        posiciones_Usadas[i] = true;
      }
    }

    for (let i = 0; i < numeros_Jugador.length; i++) {
      if (retroalimentacion[i] === "verde") continue;
      for (let j = 0; j < numeros_Secretos.length; j++) {
        if (posiciones_Usadas[j]) continue;
        if (numeros_Jugador[i] === numeros_Secretos[j]) {
          retroalimentacion[i] = "amarillo";
          posiciones_Usadas[j] = true;
          break;
        }
      }
    }

    return retroalimentacion;
  }
}
