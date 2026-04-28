import { Context } from "hono";

import { juego_Logica } from "../service/juego_Logica";

export class controlador_Juego {
  private juego_Logica: juego_Logica;

  constructor() {
    this.juego_Logica = new juego_Logica();
  }

  public iniciar_Juego = async (c: Context) => {
    try {
      const body = await c.req.json();
      const nombre_Jugador = String(body?.nombre_Jugador ?? "");
      const dificultad = String(body?.dificultad ?? "normal");

      this.juego_Logica.iniciar_Juego(nombre_Jugador, dificultad);

      return c.json(
        {
          mensaje: "Juego iniciado correctamente.",
          juego: this.juego_Logica.obtener_Estado_Publico(),
        },
        201,
      );
    } catch (error) {
      return this.responder_Error(c, error, 400);
    }
  };

  public mandar_Numeros = (c: Context) => {
    try {
      return c.json(this.juego_Logica.obtener_Estado_Publico(), 200);
    } catch (error) {
      return this.responder_Error(c, error, 400);
    }
  };

  public validar_Operacion = async (c: Context) => {
    try {
      const body = await c.req.json();
      const operacion = String(body?.operacion ?? "");
      const respuesta = JSON.parse(
        this.juego_Logica.validar_Operacion_Jugador(operacion),
      );

      return c.json(respuesta, 200);
    } catch (error) {
      return this.responder_Error(c, error, 400);
    }
  };

  public guardar_Score = async (c: Context) => {
    try {
      await this.juego_Logica.guardar_Score();

      return c.json(
        {
          mensaje: "Puntaje guardado correctamente.",
        },
        200,
      );
    } catch (error) {
      return this.responder_Error(c, error, 400);
    }
  };

  public get_ranking = async (c: Context) => {
    try {
      const ranking = JSON.parse(await this.juego_Logica.get_ranking());

      return c.json(ranking, 200);
    } catch (error) {
      return this.responder_Error(c, error, 500);
    }
  };

  private responder_Error(c: Context, error: unknown, status: number) {
    const mensaje =
      error instanceof Error ? error.message : "Ocurrio un error inesperado.";

    return c.json({ error: mensaje }, status as any);
  }
}
