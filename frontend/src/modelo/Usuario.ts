export class Usuario {
  private id_Usuario: string;
  private nombre_Usuario: string;
  private puntaje_Maximo_Usuario: number;

  constructor(
    id_Usuario: string = "",
    nombre_Usuario: string = "",
    puntaje_Maximo_Usuario: number = 0,
  ) {
    this.id_Usuario = id_Usuario;
    this.nombre_Usuario = nombre_Usuario;
    this.puntaje_Maximo_Usuario = puntaje_Maximo_Usuario;
  }

  public actualizar_Puntaje(puntaje: number): void {
    this.puntaje_Maximo_Usuario = Math.max(this.puntaje_Maximo_Usuario, puntaje);
  }

  public get_id_Usuario(): string {
    return this.id_Usuario;
  }

  public get_nombre_Usuario(): string {
    return this.nombre_Usuario;
  }

  public get_puntaje_Maximo_Usuario(): number {
    return this.puntaje_Maximo_Usuario;
  }
}
