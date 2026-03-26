import {
  Juego,
  Usuario,
  type dificultad_Juego,
  type estado_Juego_Backend,
  type respuesta_Validacion_Backend,
} from "../modelo";
import { supabase_Service } from "./supabase_Service";

type inicio_Juego_Response = {
  mensaje: string;
  juego: estado_Juego_Backend;
};

type error_Response = {
  error?: string;
  mensaje?: string;
};

type ranking_Registro = {
  nombre_jugador: string;
  puntaje: number;
  intentos_usados: number;
  estado: string;
  created_at?: string;
  finished_at?: string;
};

export class game_Service {
  private supabaseService: supabase_Service;
  private base_Url: string;

  constructor(
    supabaseService: supabase_Service = new supabase_Service(),
    base_Url: string = import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  ) {
    this.supabaseService = supabaseService;
    this.base_Url = base_Url.replace(/\/$/, "");
  }

  public async iniciar_Juego(
    nombre_Usuario: string,
    dificultad: dificultad_Juego,
  ): Promise<{ juego: Juego; usuario: Usuario; mensaje: string }> {
    const respuesta = await this.consumir_Api<inicio_Juego_Response>(
      "/api/juego/iniciar",
      {
        method: "POST",
        body: JSON.stringify({
          nombre_Jugador: nombre_Usuario,
          dificultad,
        }),
      },
    );

    const juego = Juego.desde_Estado_Backend(respuesta.juego);
    const usuario = new Usuario(
      juego.get_id_Jugador(),
      juego.get_nombre_Jugador(),
      juego.get_puntaje_Usuario(),
    );

    return {
      juego,
      usuario,
      mensaje: respuesta.mensaje,
    };
  }

  public async obtener_Estado(): Promise<Juego> {
    const respuesta = await this.consumir_Api<estado_Juego_Backend>(
      "/api/juego/estado",
    );

    return Juego.desde_Estado_Backend(respuesta);
  }

  public async enviar_Respuesta(operacion: string): Promise<Juego> {
    const respuesta = await this.consumir_Api<respuesta_Validacion_Backend>(
      "/api/juego/validar",
      {
        method: "POST",
        body: JSON.stringify({ operacion }),
      },
    );

    return Juego.desde_Validacion_Backend(respuesta);
  }

  public async guardar_Puntaje(usuario: Usuario): Promise<void> {
    if (!usuario.get_nombre_Usuario().trim()) {
      throw new Error("No hay un usuario valido para guardar el puntaje.");
    }

    await this.consumir_Api<{ mensaje: string }>("/api/juego/guardar-score", {
      method: "POST",
    });
  }

  public async obtener_Ranking(): Promise<ranking_Registro[]> {
    return this.consumir_Api<ranking_Registro[]>("/api/juego/ranking");
  }

  public async obtener_Puntaje_Usuario(id: string): Promise<number> {
    const identificador = id.trim().toLowerCase();

    if (!identificador) {
      return 0;
    }

    if (this.supabaseService.esta_Conectado()) {
      try {
        const registros = await this.supabaseService.obtener_Datos("partidas");
        const coincidencia = registros.find((registro) => {
          if (!registro || typeof registro !== "object") {
            return false;
          }

          const fila = registro as Record<string, unknown>;
          return String(fila.usuario_id ?? "").toLowerCase() === identificador;
        });

        if (coincidencia && typeof coincidencia === "object") {
          const puntaje = Number(
            (coincidencia as Record<string, unknown>).puntaje ?? 0,
          );
          return Number.isFinite(puntaje) ? puntaje : 0;
        }
      } catch {
        // Si la lectura directa falla, se usa el ranking del backend.
      }
    }

    const ranking = await this.obtener_Ranking();
    const jugador = ranking.find(
      (registro) => registro.nombre_jugador.trim().toLowerCase() === identificador,
    );

    return jugador?.puntaje ?? 0;
  }

  public get_supabase_Service(): supabase_Service {
    return this.supabaseService;
  }

  private async consumir_Api<T>(
    ruta: string,
    init?: RequestInit,
  ): Promise<T> {
    const respuesta = await fetch(`${this.base_Url}${ruta}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    const contenido = await respuesta.text();
    const data = contenido ? (JSON.parse(contenido) as T | error_Response) : null;

    if (!respuesta.ok) {
      const error = data as error_Response | null;
      throw new Error(
        error?.error ?? error?.mensaje ?? "No se pudo completar la operacion.",
      );
    }

    return data as T;
  }
}

export type { ranking_Registro };
