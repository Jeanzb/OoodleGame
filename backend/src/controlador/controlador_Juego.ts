import type { Request, Response } from "express";

import { juego_Logica } from "../service";

export class controlador_Juego {
  private juego_Logica: juego_Logica;

  constructor() {
    this.juego_Logica = new juego_Logica();
  }

  public iniciar_Juego = (req: Request, res: Response): void => {
    try {
      const nombre_Jugador = String(req.body?.nombre_Jugador ?? "");
      const dificultad = String(req.body?.dificultad ?? "normal");

      this.juego_Logica.iniciar_Juego(nombre_Jugador, dificultad);

      res.status(201).json({
        mensaje: "Juego iniciado correctamente.",
        juego: this.juego_Logica.obtener_Estado_Publico(),
      });
    } catch (error) {
      this.responder_Error(res, error, 400);
    }
  };

  public mandar_Numeros = (_req: Request, res: Response): void => {
    try {
      res.status(200).json(this.juego_Logica.obtener_Estado_Publico());
    } catch (error) {
      this.responder_Error(res, error, 400);
    }
  };

  public validar_Operacion = (req: Request, res: Response): void => {
    try {
      const operacion = String(req.body?.operacion ?? "");
      const respuesta = JSON.parse(
        this.juego_Logica.validar_Operacion_Jugador(operacion),
      );

      res.status(200).json(respuesta);
    } catch (error) {
      this.responder_Error(res, error, 400);
    }
  };

  public guardar_Score = async (_req: Request, res: Response): Promise<void> => {
    try {
      await this.juego_Logica.guardar_Score();

      res.status(200).json({
        mensaje: "Puntaje guardado correctamente.",
      });
    } catch (error) {
      this.responder_Error(res, error, 400);
    }
  };

  public get_ranking = async (_req: Request, res: Response): Promise<void> => {
    try {
      const ranking = JSON.parse(await this.juego_Logica.get_ranking());

      res.status(200).json(ranking);
    } catch (error) {
      this.responder_Error(res, error, 500);
    }
  };

  public Operation2(): void {}

  private responder_Error(
    res: Response,
    error: unknown,
    status: number,
  ): void {
    const mensaje =
      error instanceof Error ? error.message : "Ocurrio un error inesperado.";

    res.status(status).json({ error: mensaje });
  }
}
