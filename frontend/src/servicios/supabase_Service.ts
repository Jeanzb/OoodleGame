import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type registro_Datos = Record<string, unknown>;

export class supabase_Service {
  private clienteSupabase: SupabaseClient | null;
  private url: string;
  private apiKey: string;

  constructor() {
    this.url = import.meta.env.VITE_SUPABASE_URL ?? "";
    this.apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
    this.clienteSupabase = null;
    this.conectar();
  }

  public conectar(): void {
    if (!this.url || !this.apiKey) {
      this.clienteSupabase = null;
      return;
    }

    this.clienteSupabase = createClient(this.url, this.apiKey);
  }

  public esta_Conectado(): boolean {
    return this.clienteSupabase !== null;
  }

  public async insertar_Datos(
    tabla: string,
    datos: registro_Datos,
  ): Promise<unknown[]> {
    const cliente = this.obtener_Cliente();
    const { data, error } = await cliente.from(tabla).insert(datos).select();

    if (error) {
      throw new Error(`No se pudieron insertar datos en ${tabla}: ${error.message}`);
    }

    return data ?? [];
  }

  public async obtener_Datos(tabla: string): Promise<unknown[]> {
    const cliente = this.obtener_Cliente();
    const { data, error } = await cliente.from(tabla).select("*");

    if (error) {
      throw new Error(`No se pudieron consultar datos en ${tabla}: ${error.message}`);
    }

    return data ?? [];
  }

  public async eliminar_Datos(tabla: string, id: string): Promise<void> {
    const cliente = this.obtener_Cliente();
    const { error } = await cliente.from(tabla).delete().eq("id", id);

    if (error) {
      throw new Error(`No se pudieron eliminar datos en ${tabla}: ${error.message}`);
    }
  }

  private obtener_Cliente(): SupabaseClient {
    if (this.clienteSupabase === null) {
      throw new Error(
        "Supabase no esta configurado en el frontend. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.",
      );
    }

    return this.clienteSupabase;
  }
}
