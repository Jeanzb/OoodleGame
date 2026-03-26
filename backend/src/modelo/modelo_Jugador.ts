export class modelo_Jugador {
  private id_Jugador: number;
  private nombre_Jugador: string;
  private puntaje_Jugador: number;

  constructor(
    id_Jugador: number = 0,
    nombre_Jugador: string = "",
    puntaje_Jugador: number = 0,
  ) {
    this.id_Jugador = id_Jugador;
    this.nombre_Jugador = nombre_Jugador.trim();
    this.puntaje_Jugador = puntaje_Jugador;
  }

  public set_nombre_Jugador(jugador_Nombre: string): void {
    const nombre_Normalizado = jugador_Nombre.trim();

    if (!nombre_Normalizado) {
      throw new Error("El nombre del jugador no puede estar vacio.");
    }

    this.nombre_Jugador = nombre_Normalizado;
  }

  public set_puntaje_Jugador(jugador_Puntaje: number): void {
    if (!Number.isInteger(jugador_Puntaje) || jugador_Puntaje < 0) {
      throw new Error("El puntaje del jugador debe ser un entero positivo.");
    }

    this.puntaje_Jugador = jugador_Puntaje;
  }

  public get_id_Jugador(): number {
    return this.id_Jugador;
  }

  public get_nombre_Jugador(): string {
    return this.nombre_Jugador;
  }

  public get_puntaje_Jugador(): number {
    return this.puntaje_Jugador;
  }

  public get_jugador_Data(): string {
    return JSON.stringify({
      id_Jugador: this.id_Jugador,
      nombre_Jugador: this.nombre_Jugador,
      puntaje_Jugador: this.puntaje_Jugador,
    });
  }
}
