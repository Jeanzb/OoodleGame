import { randomUUID } from "crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

type usuario_Persistido = {
  id: string;
  nombre_jugador: string;
  created_at: string;
};

const TABLA_USUARIOS = "usuarios";
const usuarios_Locales = new Map<string, usuario_Persistido>();

export class usuario_DAO {
  private supabase_client: SupabaseClient | null;

  constructor(supabase_client: SupabaseClient | null) {
    this.supabase_client = supabase_client;
  }

  public async crear_usuario(nombre: string): Promise<string> {
    const nombre_Normalizado = nombre.trim();

    if (!nombre_Normalizado) {
      throw new Error("El nombre del jugador no puede estar vacio.");
    }

    const usuario_Existente = await this.get_usuario(nombre_Normalizado);

    if (usuario_Existente !== null) {
      return usuario_Existente.id;
    }

    if (this.supabase_client === null) {
      const usuario_Local = {
        id: randomUUID(),
        nombre_jugador: nombre_Normalizado,
        created_at: new Date().toISOString(),
      };

      usuarios_Locales.set(nombre_Normalizado.toLowerCase(), usuario_Local);
      return usuario_Local.id;
    }

    const { data, error } = await this.supabase_client
      .from(TABLA_USUARIOS)
      .insert({
        nombre_jugador: nombre_Normalizado,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`No se pudo crear el usuario: ${error.message}`);
    }

    return data.id;
  }

  public async get_usuario(nombre: string): Promise<usuario_Persistido | null> {
    const nombre_Normalizado = nombre.trim();

    if (!nombre_Normalizado) {
      return null;
    }

    if (this.supabase_client === null) {
      return usuarios_Locales.get(nombre_Normalizado.toLowerCase()) ?? null;
    }

    const { data, error } = await this.supabase_client
      .from(TABLA_USUARIOS)
      .select("id, nombre_jugador, created_at")
      .eq("nombre_jugador", nombre_Normalizado)
      .maybeSingle();

    if (error) {
      throw new Error(`No se pudo consultar el usuario: ${error.message}`);
    }

    return data ?? null;
  }
}
