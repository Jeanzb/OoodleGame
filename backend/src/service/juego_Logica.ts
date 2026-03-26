import { partida_DAO, usuario_DAO } from "./dao";
import { factory_Partidas } from "./factory";
import { modelo_Juego, modelo_Jugador } from "../modelo";

import { singleton_Supabase } from "./singleton_Supabase";

type dificultad_Juego = "normal" | "dificil";

type estado_Publico_Juego = {
  id_Jugador: number;
  nombre_Jugador: string;
  dificultad: dificultad_Juego;
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
  private modelo_Juego: modelo_Juego | null;
  private modelo_Jugador: modelo_Jugador | null;
  private singleton_Supabase: singleton_Supabase;
  private partida_DAO: partida_DAO;
  private usuario_DAO: usuario_DAO;
  private score_Guardado: boolean;
  private dificultad_Actual: dificultad_Juego;

  constructor() {
    this.modelo_Juego = null;
    this.modelo_Jugador = null;
    this.singleton_Supabase = singleton_Supabase.get_instance();
    const supabase_client = this.singleton_Supabase.get_client();
    this.partida_DAO = new partida_DAO(supabase_client);
    this.usuario_DAO = new usuario_DAO(supabase_client);
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

    this.modelo_Jugador = new modelo_Jugador(
      Date.now(),
      nombre_Normalizado,
      0,
    );
    this.dificultad_Actual = dificultad_Normalizada;
    this.modelo_Juego = factory_Partidas.crear_Partida(dificultad_Normalizada);
    this.score_Guardado = false;
  }

  public generar_Round(): void {
    this.obtener_Jugador_Activo();
    this.modelo_Juego = factory_Partidas.crear_Partida(this.dificultad_Actual);
    this.score_Guardado = false;
  }

  public validar_Operacion_Jugador(operacion: string): string {
    const juego_Actual = this.obtener_Juego_Activo();
    const operacion_Normalizada = this.normalizar_Operacion(operacion);
    const numeros_Jugador = this.extraer_Numeros_Operacion(operacion_Normalizada);
    const numeros_Secretos = juego_Actual.get_Numeros();
    const resultado_Operacion = juego_Actual.validar_Operacion(operacion_Normalizada);
    const es_Correcta = juego_Actual.validar_respuesta(operacion_Normalizada);

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

    if (juego_Actual.is_Terminado()) {
      respuesta.solucion = numeros_Secretos;
    }

    return JSON.stringify(respuesta);
  }

  public actualizar_Score(): void {
    const juego_Actual = this.obtener_Juego_Activo();
    const jugador_Actual = this.obtener_Jugador_Activo();
    const puntaje_Actual =
      juego_Actual.get_estatus_Juego() === "ganado"
        ? juego_Actual.get_puntaje()
        : 0;

    jugador_Actual.set_puntaje_Jugador(puntaje_Actual);
  }

  public async guardar_Score(): Promise<void> {
    const juego_Actual = this.obtener_Juego_Activo();
    const jugador_Actual = this.obtener_Jugador_Activo();

    if (!juego_Actual.is_Terminado()) {
      throw new Error("El juego debe terminar antes de guardar el puntaje.");
    }

    if (this.score_Guardado) {
      return;
    }

    this.actualizar_Score();

    const usuario_id = await this.usuario_DAO.crear_usuario(
      jugador_Actual.get_nombre_Jugador(),
    );

    await this.partida_DAO.insertar_partida({
      usuario_id,
      nombre_jugador: jugador_Actual.get_nombre_Jugador(),
      ecuacion_jugada: juego_Actual.get_expresion_Juego(),
      dificultad: this.dificultad_Actual,
      estado: this.mapear_Estado_Partida(juego_Actual.get_estatus_Juego()),
      intentos_usados: juego_Actual.get_intentos_Jugador(),
      puntaje: jugador_Actual.get_puntaje_Jugador(),
      finished_at: new Date().toISOString(),
    });

    this.score_Guardado = true;
  }

  public async get_ranking(): Promise<string> {
    return JSON.stringify(await this.partida_DAO.obtener_ranking());
  }

  public obtener_Estado_Publico(): estado_Publico_Juego {
    const juego_Actual = this.obtener_Juego_Activo();
    const jugador_Actual = this.obtener_Jugador_Activo();
    const estado_Publico: estado_Publico_Juego = {
      id_Jugador: jugador_Actual.get_id_Jugador(),
      nombre_Jugador: jugador_Actual.get_nombre_Jugador(),
      dificultad: this.dificultad_Actual,
      ecuacion_Generada: "A+B*C-D",
      numero_Objetivo: juego_Actual.get_numero_Objetivo(),
      intentos_Jugador: juego_Actual.get_intentos_Jugador(),
      intentos_Maximos: juego_Actual.get_intentos_Maximos(),
      intentos_Restantes: juego_Actual.get_intentos_Restantes(),
      puntaje_Actual: juego_Actual.get_puntaje(),
      puntaje_Jugador: jugador_Actual.get_puntaje_Jugador(),
      estatus_Juego: juego_Actual.get_estatus_Juego(),
      rango_Minimo: juego_Actual.get_rango_Minimo(),
      rango_Maximo: juego_Actual.get_rango_Maximo(),
      total_Numeros: juego_Actual.get_Numeros().length,
    };

    if (juego_Actual.is_Terminado()) {
      estado_Publico.solucion = juego_Actual.get_Numeros();
    }

    return estado_Publico;
  }

  private obtener_Juego_Activo(): modelo_Juego {
    if (this.modelo_Juego === null) {
      throw new Error("Primero debes iniciar el juego.");
    }

    return this.modelo_Juego;
  }

  private obtener_Jugador_Activo(): modelo_Jugador {
    if (this.modelo_Jugador === null) {
      throw new Error("Primero debes iniciar el juego con un jugador.");
    }

    return this.modelo_Jugador;
  }

  private normalizar_Dificultad(dificultad: string): dificultad_Juego {
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

    return coincidencias.slice(1).map((valor) => Number(valor));
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

    for (let indice = 0; indice < numeros_Jugador.length; indice += 1) {
      if (numeros_Jugador[indice] === numeros_Secretos[indice]) {
        retroalimentacion[indice] = "verde";
        posiciones_Usadas[indice] = true;
      }
    }

    for (
      let indice_Jugador = 0;
      indice_Jugador < numeros_Jugador.length;
      indice_Jugador += 1
    ) {
      if (retroalimentacion[indice_Jugador] === "verde") {
        continue;
      }

      for (
        let indice_Secreto = 0;
        indice_Secreto < numeros_Secretos.length;
        indice_Secreto += 1
      ) {
        if (posiciones_Usadas[indice_Secreto]) {
          continue;
        }

        if (
          numeros_Jugador[indice_Jugador] === numeros_Secretos[indice_Secreto]
        ) {
          retroalimentacion[indice_Jugador] = "amarillo";
          posiciones_Usadas[indice_Secreto] = true;
          break;
        }
      }
    }

    return retroalimentacion;
  }

  private mapear_Estado_Partida(
    estatus_Juego: string,
  ): "victoria" | "derrota" | "abandonada" {
    if (estatus_Juego === "ganado") {
      return "victoria";
    }

    if (estatus_Juego === "perdido") {
      return "derrota";
    }

    return "abandonada";
  }
}
