import { Hono } from "hono";

import { controlador_Jugador } from "../controlador/controlador_Jugador";

export class JugadorRoutes {
  public static get router() {
    const router = new Hono();
    const controller = new controlador_Jugador();

    router.post("/", controller.crearJugador);
    router.get("/", controller.listarJugadores);
    router.get("/:id", controller.obtenerJugador);
    router.post("/:id/puntaje", controller.sumarPuntaje);

    return router;
  }
}
