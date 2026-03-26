import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class singleton_Supabase {
  private static instance: singleton_Supabase | null = null;
  private supabase_Url: string;
  private supabase_Key: string;
  private supabase_Client: SupabaseClient | null;

  private constructor() {
    this.supabase_Url = process.env.SUPABASE_URL ?? "";
    this.supabase_Key = process.env.SUPABASE_KEY ?? "";
    this.supabase_Client =
      this.supabase_Url && this.supabase_Key
        ? createClient(this.supabase_Url, this.supabase_Key)
        : null;
  }

  public static get_instance(): singleton_Supabase {
    if (singleton_Supabase.instance === null) {
      singleton_Supabase.instance = new singleton_Supabase();
    }

    return singleton_Supabase.instance;
  }

  public get_client(): SupabaseClient | null {
    return this.supabase_Client;
  }
}
