import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type OrderRow = {
  id: string;
  email: string | null;
  phone: string;
  package: string;
  audio_url: string;
  voice_id: string | null;
  status: string;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
};

export async function createOrder(data: Partial<OrderRow>) {
  const { data: row, error } = await supabaseAdmin
    .from("orders").insert(data).select().single();
  if (error) throw error;
  return row;
}

export async function updateOrder(id: string, patch: Partial<OrderRow>) {
  const { data, error } = await supabaseAdmin
    .from("orders").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function getOrder(id: string) {
  const { data, error } = await supabaseAdmin
    .from("orders").select("*").eq("id", id).single();
  if (error) throw error;
  return data as OrderRow;
}
