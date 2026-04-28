import type { SupabaseClient } from "@supabase/supabase-js";
import { DAO } from "../DAO";
import { Jugador } from "../../modelo/modelo_Jugador";
import { SingletonSupabase } from "../singleton_Supabase";

const TABLA_USUARIOS = "usuarios";

export class JugadorDAO implements DAO<Jugador> {
  private supabaseClient: SupabaseClient | null;
  private jugadoresLocales: Map<number, Jugador>;
  private nombreAJugador: Map<string, number>;

  constructor() {
    const singleton = SingletonSupabase.getInstance();
    this.supabaseClient = singleton.getClient();
    this.jugadoresLocales = new Map();
    this.nombreAJugador = new Map();
  }

  public async create(entidad: Jugador): Promise<boolean> {
    try {
      const nombre = entidad.getNombre();

      if (this.supabaseClient === null) {
        this.jugadoresLocales.set(entidad.getIdJugador(), entidad);
        this.nombreAJugador.set(nombre.toLowerCase(), entidad.getIdJugador());
        return true;
      }

      const existente = await this.obtenerPorNombre(nombre);
      if (existente) {
        this.jugadoresLocales.set(entidad.getIdJugador(), entidad);
        return true;
      }

      const { error } = await this.supabaseClient
        .from(TABLA_USUARIOS)
        .insert({ nombre_jugador: nombre });

      if (error) throw error;

      this.jugadoresLocales.set(entidad.getIdJugador(), entidad);
      this.nombreAJugador.set(nombre.toLowerCase(), entidad.getIdJugador());
      return true;
    } catch {
      return false;
    }
  }

  public async obtener(id: number): Promise<Jugador | null> {
    if (this.jugadoresLocales.has(id)) {
      return this.jugadoresLocales.get(id) ?? null;
    }
    return null;
  }

  public async obtenerPorNombre(nombre: string): Promise<Jugador | null> {
    const normalizado = nombre.trim().toLowerCase();
    if (!normalizado) return null;

    if (this.nombreAJugador.has(normalizado)) {
      const id = this.nombreAJugador.get(normalizado)!;
      return this.jugadoresLocales.get(id) ?? null;
    }

    if (this.supabaseClient === null) {
      return null;
    }

    const { data, error } = await this.supabaseClient
      .from(TABLA_USUARIOS)
      .select("id, nombre_jugador, created_at")
      .eq("nombre_jugador", normalizado)
      .maybeSingle();

    if (error || !data) return null;

    const jugador = new Jugador(Date.now(), data.nombre_jugador, 0);
    this.jugadoresLocales.set(jugador.getIdJugador(), jugador);
    this.nombreAJugador.set(normalizado, jugador.getIdJugador());
    return jugador;
  }

  public async listar(): Promise<Jugador[]> {
    if (this.supabaseClient === null) {
      return Array.from(this.jugadoresLocales.values());
    }
    const { data, error } = await this.supabaseClient
      .from(TABLA_USUARIOS)
      .select("nombre_jugador");

    if (error) {
      throw new Error(`No se pudieron listar jugadores: ${error.message}`);
    }

    return (data ?? []).map(
      (r: any) => new Jugador(0, r.nombre_jugador, 0),
    );
  }

  public async actualizarPuntaje(id: number, puntos: number): Promise<boolean> {
    const jugador = await this.obtener(id);
    if (!jugador) return false;
    jugador.sumarPuntaje(puntos);
    return true;
  }
}
