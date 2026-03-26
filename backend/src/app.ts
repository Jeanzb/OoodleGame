import dotenv from "dotenv";
import cors from "cors";
import express from "express";

import { controlador_Juego } from "./controlador";

dotenv.config({ quiet: true });

const app = express();
const controlador_Juego_Instancia = new controlador_Juego();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    mensaje: "Backend de Ooodle activo.",
    endpoints: [
      "GET /health",
      "POST /api/juego/iniciar",
      "GET /api/juego/estado",
      "POST /api/juego/validar",
      "POST /api/juego/guardar-score",
      "GET /api/juego/ranking",
    ],
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/api/juego/iniciar", controlador_Juego_Instancia.iniciar_Juego);
app.get("/api/juego/estado", controlador_Juego_Instancia.mandar_Numeros);
app.post("/api/juego/validar", controlador_Juego_Instancia.validar_Operacion);
app.post("/api/juego/guardar-score", controlador_Juego_Instancia.guardar_Score);
app.get("/api/juego/ranking", controlador_Juego_Instancia.get_ranking);

export { app };
