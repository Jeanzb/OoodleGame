export class Jugador {
  private idJugador: number;
  private nombreJugador: string;
  private puntajeJugador: number;

  constructor(
    idJugador: number = 0,
    nombreJugador: string = "",
    puntajeJugador: number = 0,
  ) {
    this.idJugador = idJugador;
    this.nombreJugador = nombreJugador.trim();
    this.puntajeJugador = puntajeJugador;
  }

  public getNombre(): string {
    return this.nombreJugador;
  }

  public getPuntajeTotal(): number {
    return this.puntajeJugador;
  }

  public sumarPuntaje(puntos: number): void {
    if (!Number.isInteger(puntos) || puntos < 0) {
      throw new Error("Los puntos deben ser un entero positivo.");
    }
    this.puntajeJugador += puntos;
  }

  public reiniciarPuntaje(): void {
    this.puntajeJugador = 0;
  }

  public getIdJugador(): number {
    return this.idJugador;
  }

  public setNombreJugador(nombre: string): void {
    const normalizado = nombre.trim();
    if (!normalizado) {
      throw new Error("El nombre del jugador no puede estar vacio.");
    }
    this.nombreJugador = normalizado;
  }
}
