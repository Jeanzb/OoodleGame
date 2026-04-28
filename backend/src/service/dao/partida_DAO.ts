import type { SupabaseClient } from "@supabase/supabase-js";
import { DAO } from "../DAO";
import { Partida } from "../../modelo/modelo_Juego";
import { Jugador } from "../../modelo/modelo_Jugador";
import { SingletonSupabase } from "../singleton_Supabase";

const TABLA_PARTIDAS = "partidas";

export class PartidaDAO implements DAO<Partida> {
  private supabaseClient: SupabaseClient | null;
  private partidasLocales: Map<number, Partida>;

  constructor() {
    const singleton = SingletonSupabase.getInstance();
    this.supabaseClient = singleton.getClient();
    this.partidasLocales = new Map();
  }

  public async create(entidad: Partida): Promise<boolean> {
    try {
      if (this.supabaseClient === null) {
        this.partidasLocales.set(
          entidad.getJugador().getIdJugador(),
          entidad,
        );
        return true;
      }

      const { error } = await this.supabaseClient.from(TABLA_PARTIDAS).insert({
        usuario_id: null,
        ecuacion_jugada: entidad.getExpresionJuego(),
        dificultad: "normal",
        estado: this.mapearEstado(entidad.getEstado()),
        intentos_usados: entidad.getIntentosJugador(),
        puntaje: entidad.getPuntaje(),
        finished_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  }

  public async obtener(id: number): Promise<Partida | null> {
    if (this.partidasLocales.has(id)) {
      return this.partidasLocales.get(id) ?? null;
    }
    return null;
  }

  public async obtenerRanking(): Promise<Jugador[]> {
    if (this.supabaseClient === null) {
      const jugadores = new Map<string, Jugador>();
      for (const partida of this.partidasLocales.values()) {
        const j = partida.getJugador();
        const existente = jugadores.get(j.getNombre());
        if (!existente || j.getPuntajeTotal() > existente.getPuntajeTotal()) {
          jugadores.set(j.getNombre(), j);
        }
      }
      return Array.from(jugadores.values())
        .sort((a, b) => b.getPuntajeTotal() - a.getPuntajeTotal())
        .slice(0, 10);
    }

    const { data, error } = await this.supabaseClient
      .from(TABLA_PARTIDAS)
      .select("nombre_jugador, puntaje, intentos_usados, estado, created_at, finished_at")
      .order("puntaje", { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`No se pudo consultar el ranking: ${error.message}`);
    }

    return (data ?? []).map(
      (r: any) => new Jugador(0, r.nombre_jugador ?? "anonimo", r.puntaje),
    );
  }

  public async obtenerRankingPartidas(): Promise<
    {
      nombre_jugador: string;
      puntaje: number;
      intentos_usados: number;
      estado: string;
      created_at: string;
      finished_at: string;
    }[]
  > {
    if (this.supabaseClient === null) {
      return Array.from(this.partidasLocales.values()).map((p) => ({
        nombre_jugador: p.getJugador().getNombre(),
        puntaje: p.getPuntaje(),
        intentos_usados: p.getIntentosJugador(),
        estado: p.getEstado(),
        created_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
      }));
    }

    const { data, error } = await this.supabaseClient
      .from(TABLA_PARTIDAS)
      .select("nombre_jugador, puntaje, intentos_usados, estado, created_at, finished_at")
      .order("puntaje", { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`No se pudo consultar el ranking: ${error.message}`);
    }

    return (data ?? []).map((r: any) => ({
      nombre_jugador: r.nombre_jugador ?? "anonimo",
      puntaje: r.puntaje,
      intentos_usados: r.intentos_usados,
      estado: r.estado,
      created_at: r.created_at,
      finished_at: r.finished_at,
    }));
  }

  private mapearEstado(estado: string): "victoria" | "derrota" | "abandonada" {
    if (estado === "ganado") return "victoria";
    if (estado === "perdido") return "derrota";
    return "abandonada";
  }
}
