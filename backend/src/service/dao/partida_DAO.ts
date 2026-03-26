import type { SupabaseClient } from "@supabase/supabase-js";

type partida_Persistida = {
  usuario_id: string | null;
  nombre_jugador: string;
  ecuacion_jugada: string;
  dificultad: "normal" | "dificil";
  estado: "victoria" | "derrota" | "abandonada";
  intentos_usados: number;
  puntaje: number;
  finished_at: string;
};

type ranking_Partida = {
  nombre_jugador: string;
  puntaje: number;
  intentos_usados: number;
  estado: "victoria" | "derrota" | "abandonada";
  created_at: string;
  finished_at: string;
};

type partida_Ranking_Registro = {
  usuario_id: string | null;
  puntaje: number;
  intentos_usados: number;
  estado: "victoria" | "derrota" | "abandonada";
  created_at: string;
  finished_at: string;
};

type usuario_Registro = {
  id: string;
  nombre_jugador: string;
};

const TABLA_PARTIDAS = "partidas";
const TABLA_USUARIOS = "usuarios";
const ranking_Local: ranking_Partida[] = [];

export class partida_DAO {
  private supabase_client: SupabaseClient | null;
  private Attribute1: string;

  constructor(supabase_client: SupabaseClient | null) {
    this.supabase_client = supabase_client;
    this.Attribute1 = "";
  }

  public async insertar_partida(partida: partida_Persistida): Promise<void> {
    if (this.supabase_client === null) {
      ranking_Local.push({
        nombre_jugador: partida.nombre_jugador,
        puntaje: partida.puntaje,
        intentos_usados: partida.intentos_usados,
        estado: partida.estado,
        created_at: new Date().toISOString(),
        finished_at: partida.finished_at,
      });
      return;
    }

    const { error } = await this.supabase_client.from(TABLA_PARTIDAS).insert({
      usuario_id: partida.usuario_id,
      ecuacion_id: null,
      ecuacion_jugada: partida.ecuacion_jugada,
      dificultad: partida.dificultad,
      estado: partida.estado,
      intentos_usados: partida.intentos_usados,
      puntaje: partida.puntaje,
      finished_at: partida.finished_at,
    });

    if (error) {
      throw new Error(`No se pudo guardar la partida: ${error.message}`);
    }
  }

  public async obtener_ranking(): Promise<ranking_Partida[]> {
    if (this.supabase_client === null) {
      return [...ranking_Local]
        .sort((registro_A, registro_B) => {
          if (registro_B.puntaje !== registro_A.puntaje) {
            return registro_B.puntaje - registro_A.puntaje;
          }

          return registro_A.created_at.localeCompare(registro_B.created_at);
        })
        .slice(0, 10);
    }

    const { data, error } = await this.supabase_client
      .from(TABLA_PARTIDAS)
      .select("usuario_id, puntaje, intentos_usados, estado, created_at, finished_at")
      .order("puntaje", { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`No se pudo consultar el ranking: ${error.message}`);
    }

    const registros = (data ?? []) as partida_Ranking_Registro[];
    const ids_Usuario = registros
      .map((registro) => registro.usuario_id)
      .filter((id): id is string => typeof id === "string");
    const mapa_Usuarios = await this.obtener_Mapa_Usuarios(ids_Usuario);

    return registros.map((registro) => ({
      nombre_jugador: registro.usuario_id
        ? (mapa_Usuarios.get(registro.usuario_id) ?? "anonimo")
        : "anonimo",
      puntaje: registro.puntaje,
      intentos_usados: registro.intentos_usados,
      estado: registro.estado,
      created_at: registro.created_at,
      finished_at: registro.finished_at,
    }));
  }

  private async obtener_Mapa_Usuarios(
    ids_Usuario: string[],
  ): Promise<Map<string, string>> {
    const mapa_Usuarios = new Map<string, string>();

    if (ids_Usuario.length === 0 || this.supabase_client === null) {
      return mapa_Usuarios;
    }

    const ids_Unicos = [...new Set(ids_Usuario)];
    const { data, error } = await this.supabase_client
      .from(TABLA_USUARIOS)
      .select("id, nombre_jugador")
      .in("id", ids_Unicos);

    if (error) {
      throw new Error(`No se pudieron consultar los usuarios: ${error.message}`);
    }

    for (const usuario of (data ?? []) as usuario_Registro[]) {
      mapa_Usuarios.set(usuario.id, usuario.nombre_jugador);
    }

    return mapa_Usuarios;
  }
}
