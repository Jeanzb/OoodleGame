import { Hono } from "hono";

import { controlador_Juego } from "../controlador/controlador_Juego";

export class JuegoRoutes {
  public static get router() {
    const router = new Hono();
    const controller = new controlador_Juego();

    router.post("/iniciar", controller.iniciar_Juego);
    router.get("/estado", controller.mandar_Numeros);
    router.post("/validar", controller.validar_Operacion);
    router.post("/guardar-score", controller.guardar_Score);
    router.get("/ranking", controller.get_ranking);

    return router;
  }
}
