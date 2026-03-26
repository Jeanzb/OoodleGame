import { Juego, Usuario, type dificultad_Juego } from "../modelo";
import { game_Service, type ranking_Registro } from "../servicios";

export class juego_Vista {
  private juego: Juego | null;
  private game_Service: game_Service;

  constructor(game_Service_Instancia: game_Service = new game_Service()) {
    this.juego = null;
    this.game_Service = game_Service_Instancia;
  }

  public async iniciar_Juego(
    nombre_Usuario: string,
    dificultad: dificultad_Juego,
  ): Promise<{ juego: Juego; usuario: Usuario; mensaje: string }> {
    const respuesta = await this.game_Service.iniciar_Juego(
      nombre_Usuario,
      dificultad,
    );
    this.juego = respuesta.juego;
    return respuesta;
  }

  public async sincronizar_Estado(): Promise<Juego> {
    const juego = await this.game_Service.obtener_Estado();
    this.juego = juego;
    return juego;
  }

  public mostrar_Ecuacion(): string {
    if (this.juego === null) {
      return "A + B \u00D7 C - D";
    }

    return this.juego.get_ecuacion_Formateada();
  }

  public async enviar_Respuesta(operacion: string): Promise<Juego> {
    const juego = await this.game_Service.enviar_Respuesta(operacion);
    this.juego = juego;
    return juego;
  }

  public async guardar_Puntaje(usuario: Usuario): Promise<void> {
    await this.game_Service.guardar_Puntaje(usuario);
  }

  public async obtener_Ranking(): Promise<ranking_Registro[]> {
    return this.game_Service.obtener_Ranking();
  }

  public obtener_Juego(): Juego | null {
    return this.juego;
  }
}
