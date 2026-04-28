import { Hono } from "hono";

import { JuegoRoutes } from "./juego.routes";
import { JugadorRoutes } from "./jugador.routes";

export class AppRoutes {
  public static get router() {
    const router = new Hono();
    const apiRouter = new Hono();

    apiRouter.get("/health", (c) =>
      c.json({
        status: "ok",
        timestamp: new Date().toISOString(),
      }),
    );

    apiRouter.route("/juego", JuegoRoutes.router);
    apiRouter.route("/jugadores", JugadorRoutes.router);

    router.route("/api", apiRouter);

    return router;
  }
}
