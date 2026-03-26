export type dificultad_Juego = "normal" | "dificil";

export type estado_Juego_Backend = {
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

export type respuesta_Validacion_Backend = estado_Juego_Backend & {
  operacion_Validada: string;
  resultado_Operacion: number;
  es_Correcta: boolean;
  retroalimentacion: string[];
};

export class Juego {
  private id_Jugador: string;
  private nombre_Jugador: string;
  private ecuacion: string;
  private operacion_Intento: string;
  private resultado_Correcto: number;
  private resultado_Usuario: number;
  private nivel: number;
  private puntaje: number;
  private puntaje_Usuario: number;
  private dificultad: dificultad_Juego;
  private intentos_Jugador: number;
  private intentos_Maximos: number;
  private intentos_Restantes: number;
  private estatus_Juego: string;
  private rango_Minimo: number;
  private rango_Maximo: number;
  private total_Numeros: number;
  private retroalimentacion: string[];
  private solucion: number[];
  private es_Correcta: boolean;

  constructor() {
    this.id_Jugador = "";
    this.nombre_Jugador = "";
    this.ecuacion = "";
    this.operacion_Intento = "";
    this.resultado_Correcto = 0;
    this.resultado_Usuario = 0;
    this.nivel = 1;
    this.puntaje = 0;
    this.puntaje_Usuario = 0;
    this.dificultad = "normal";
    this.intentos_Jugador = 0;
    this.intentos_Maximos = 6;
    this.intentos_Restantes = 6;
    this.estatus_Juego = "pendiente";
    this.rango_Minimo = 1;
    this.rango_Maximo = 9;
    this.total_Numeros = 4;
    this.retroalimentacion = [];
    this.solucion = [];
    this.es_Correcta = false;
  }

  public static desde_Estado_Backend(estado: estado_Juego_Backend): Juego {
    const juego = new Juego();
    juego.actualizar_Desde_Estado(estado);
    return juego;
  }

  public static desde_Validacion_Backend(
    estado: respuesta_Validacion_Backend,
  ): Juego {
    const juego = Juego.desde_Estado_Backend(estado);
    juego.operacion_Intento = estado.operacion_Validada;
    juego.resultado_Usuario = estado.resultado_Operacion;
    juego.es_Correcta = estado.es_Correcta;
    juego.retroalimentacion = [...estado.retroalimentacion];
    return juego;
  }

  public actualizar_Desde_Estado(estado: estado_Juego_Backend): void {
    this.id_Jugador = String(estado.id_Jugador);
    this.nombre_Jugador = estado.nombre_Jugador;
    this.ecuacion = estado.ecuacion_Generada;
    this.resultado_Correcto = estado.numero_Objetivo;
    this.nivel = estado.dificultad === "dificil" ? 2 : 1;
    this.puntaje = estado.puntaje_Actual;
    this.puntaje_Usuario = estado.puntaje_Jugador;
    this.dificultad = estado.dificultad;
    this.intentos_Jugador = estado.intentos_Jugador;
    this.intentos_Maximos = estado.intentos_Maximos;
    this.intentos_Restantes = estado.intentos_Restantes;
    this.estatus_Juego = estado.estatus_Juego;
    this.rango_Minimo = estado.rango_Minimo;
    this.rango_Maximo = estado.rango_Maximo;
    this.total_Numeros = estado.total_Numeros;
    this.solucion = [...(estado.solucion ?? [])];
  }

  public generar_Ecuacion(): string {
    return this.ecuacion || "A+B*C-D";
  }

  public verificar_Respuesta(): boolean {
    return this.es_Correcta || this.resultado_Usuario === this.resultado_Correcto;
  }

  public limpiarJuego(): void {
    this.ecuacion = "";
    this.operacion_Intento = "";
    this.resultado_Usuario = 0;
    this.retroalimentacion = [];
    this.solucion = [];
    this.es_Correcta = false;
    this.intentos_Jugador = 0;
    this.intentos_Restantes = this.intentos_Maximos;
    this.estatus_Juego = "pendiente";
    this.puntaje = 0;
  }

  public get_id_Jugador(): string {
    return this.id_Jugador;
  }

  public get_nombre_Jugador(): string {
    return this.nombre_Jugador;
  }

  public get_ecuacion(): string {
    return this.generar_Ecuacion();
  }

  public get_ecuacion_Formateada(): string {
    return this.generar_Ecuacion()
      .replace(/\*/g, " x ")
      .replace(/\+/g, " + ")
      .replace(/-/g, " - ");
  }

  public get_operacion_Intento(): string {
    return this.operacion_Intento;
  }

  public get_operacion_Intento_Formateada(): string {
    if (!this.operacion_Intento) {
      return "";
    }

    return this.operacion_Intento
      .replace(/\*/g, " x ")
      .replace(/\+/g, " + ")
      .replace(/-/g, " - ");
  }

  public get_solucion_Formateada(): string {
    if (this.solucion.length !== this.total_Numeros) {
      return "";
    }

    return this.formatear_Solucion(this.solucion)
      .replace(/\*/g, " x ")
      .replace(/\+/g, " + ")
      .replace(/-/g, " - ")
      .replace(/=/g, " = ");
  }

  public get_resultado_Correcto(): number {
    return this.resultado_Correcto;
  }

  public get_resultado_Usuario(): number {
    return this.resultado_Usuario;
  }

  public get_nivel(): number {
    return this.nivel;
  }

  public get_puntaje(): number {
    return this.puntaje;
  }

  public get_puntaje_Usuario(): number {
    return this.puntaje_Usuario;
  }

  public get_dificultad(): dificultad_Juego {
    return this.dificultad;
  }

  public get_intentos_Jugador(): number {
    return this.intentos_Jugador;
  }

  public get_intentos_Maximos(): number {
    return this.intentos_Maximos;
  }

  public get_intentos_Restantes(): number {
    return this.intentos_Restantes;
  }

  public get_estatus_Juego(): string {
    return this.estatus_Juego;
  }

  public get_rango_Minimo(): number {
    return this.rango_Minimo;
  }

  public get_rango_Maximo(): number {
    return this.rango_Maximo;
  }

  public get_total_Numeros(): number {
    return this.total_Numeros;
  }

  public get_retroalimentacion(): string[] {
    return [...this.retroalimentacion];
  }

  public get_solucion(): number[] {
    return [...this.solucion];
  }

  public get_es_Correcta(): boolean {
    return this.es_Correcta;
  }

  public get_numeros_Intento(): number[] {
    const ecuacion = this.normalizar_Ecuacion(this.operacion_Intento);

    if (!ecuacion) {
      return [];
    }

    const coincidencias = ecuacion.match(/^(\d+)\+(\d+)\*(\d+)-(\d+)$/);

    if (!coincidencias) {
      return [];
    }

    return coincidencias.slice(1).map((valor) => Number(valor));
  }

  private formatear_Solucion(numeros: number[]): string {
    const resultado = numeros[0] + numeros[1] * numeros[2] - numeros[3];
    return `${numeros[0]}+${numeros[1]}*${numeros[2]}-${numeros[3]}=${resultado}`;
  }

  private normalizar_Ecuacion(ecuacion: string): string {
    return ecuacion.replace(/\s+/g, "").replace(/[xX]/g, "*");
  }
}
