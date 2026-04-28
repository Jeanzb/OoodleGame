import dotenv from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { AppRoutes } from "./routes";

dotenv.config({ quiet: true });

const app = new Hono();

app.use(cors());

app.get("/", (c) => {
  return c.json({
    mensaje: "Backend de Ooodle activo.",
    endpoints: [
      "GET /api/health",
      "POST /api/juego/iniciar",
      "GET /api/juego/estado",
      "POST /api/juego/validar",
      "POST /api/juego/guardar-score",
      "GET /api/juego/ranking",
      "POST /api/jugadores",
      "GET /api/jugadores",
      "GET /api/jugadores/:id",
      "POST /api/jugadores/:id/puntaje",
    ],
  });
});

app.route("/", AppRoutes.router);

export { app };
