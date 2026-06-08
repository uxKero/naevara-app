import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True cuando hay credenciales de Supabase cargadas (server-side). */
export const supabaseConfigured = Boolean(url && serviceKey);

/**
 * Cliente de Supabase con service_role. SOLO debe usarse en código de servidor
 * (API routes), nunca en componentes cliente: la service_role saltea RLS.
 */
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url as string, serviceKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

/** Id de la fila única que guarda todo el personaje. */
export const CHARACTER_ID = process.env.CHARACTER_ID || "naevara";
