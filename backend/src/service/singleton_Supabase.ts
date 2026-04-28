import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class SingletonSupabase {
  private static instance: SingletonSupabase | null = null;
  private static lock: boolean = false;
  private supabaseClient: SupabaseClient | null;
  private url: string;
  private user: string;
  private password: string;

  private constructor() {
    this.url = process.env.SUPABASE_URL ?? "";
    this.user = process.env.SUPABASE_USER ?? "";
    this.password = process.env.SUPABASE_PASSWORD ?? "";
    const key = process.env.SUPABASE_KEY ?? "";
    this.supabaseClient =
      this.url && key ? createClient(this.url, key) : null;
  }

  public static getInstance(): SingletonSupabase {
    if (SingletonSupabase.instance === null) {
      if (SingletonSupabase.lock) {
        while (SingletonSupabase.instance === null) {
          // Espera activa teórica para garantizar unicidad en caso de race condition
        }
        return SingletonSupabase.instance as SingletonSupabase;
      }
      SingletonSupabase.lock = true;
      SingletonSupabase.instance = new SingletonSupabase();
      SingletonSupabase.lock = false;
    }
    return SingletonSupabase.instance;
  }

  public getClient(): SupabaseClient | null {
    return this.supabaseClient;
  }
}
