import { Context } from "hono";

import { JugadorDAO } from "../service/dao/usuario_DAO";
import { Jugador } from "../modelo/modelo_Jugador";

export class controlador_Jugador {
  private jugadorDAO: JugadorDAO;

  constructor() {
    this.jugadorDAO = new JugadorDAO();
  }

  public crearJugador = async (c: Context) => {
    try {
      const body = await c.req.json();
      const nombre = String(body?.nombre ?? "");
      if (!nombre.trim()) {
        return c.json({ error: "El nombre es obligatorio." }, 400);
      }
      const jugador = new Jugador(Date.now(), nombre, 0);
      const creado = await this.jugadorDAO.create(jugador);
      if (!creado) {
        return c.json({ error: "No se pudo crear el jugador." }, 500);
      }
      return c.json(
        {
          mensaje: "Jugador creado.",
          jugador: {
            idJugador: jugador.getIdJugador(),
            nombreJugador: jugador.getNombre(),
            puntajeJugador: jugador.getPuntajeTotal(),
          },
        },
        201,
      );
    } catch (error) {
      return this.responderError(c, error, 400);
    }
  };

  public obtenerJugador = async (c: Context) => {
    try {
      const id = Number(c.req.param("id"));
      const jugador = await this.jugadorDAO.obtener(id);
      if (!jugador) {
        return c.json({ error: "Jugador no encontrado." }, 404);
      }
      return c.json(
        {
          idJugador: jugador.getIdJugador(),
          nombreJugador: jugador.getNombre(),
          puntajeJugador: jugador.getPuntajeTotal(),
        },
        200,
      );
    } catch (error) {
      return this.responderError(c, error, 500);
    }
  };

  public listarJugadores = async (c: Context) => {
    try {
      const jugadores = await this.jugadorDAO.listar();
      return c.json(
        jugadores.map((j) => ({
          idJugador: j.getIdJugador(),
          nombreJugador: j.getNombre(),
          puntajeJugador: j.getPuntajeTotal(),
        })),
        200,
      );
    } catch (error) {
      return this.responderError(c, error, 500);
    }
  };

  public sumarPuntaje = async (c: Context) => {
    try {
      const id = Number(c.req.param("id"));
      const body = await c.req.json();
      const puntos = Number(body?.puntos ?? 0);
      if (!Number.isInteger(puntos) || puntos < 0) {
        return c.json(
          { error: "Los puntos deben ser un entero positivo." },
          400,
        );
      }
      const ok = await this.jugadorDAO.actualizarPuntaje(id, puntos);
      if (!ok) {
        return c.json({ error: "Jugador no encontrado." }, 404);
      }
      const jugador = await this.jugadorDAO.obtener(id);
      return c.json(
        {
          mensaje: "Puntaje actualizado.",
          jugador: {
            idJugador: jugador?.getIdJugador(),
            nombreJugador: jugador?.getNombre(),
            puntajeJugador: jugador?.getPuntajeTotal(),
          },
        },
        200,
      );
    } catch (error) {
      return this.responderError(c, error, 400);
    }
  };

  private responderError(c: Context, error: unknown, status: number) {
    const mensaje =
      error instanceof Error ? error.message : "Ocurrio un error inesperado.";
    return c.json({ error: mensaje }, status as any);
  }
}
