import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * SQL Schema — run in Supabase SQL editor before deploying
 *
 * create table audits (
 *   id uuid primary key,
 *   input jsonb not null,
 *   recommendations jsonb not null,
 *   total_monthly_spend numeric not null,
 *   total_monthly_savings numeric not null,
 *   total_annual_savings numeric not null,
 *   optimized_monthly_spend numeric not null,
 *   savings_percentage numeric not null,
 *   summary text,
 *   created_at timestamptz default now()
 * );
 *
 * create table audit_tools (
 *   id uuid primary key default gen_random_uuid(),
 *   audit_id uuid references audits(id) on delete cascade,
 *   tool_name text not null,
 *   plan text not null,
 *   monthly_spend numeric not null,
 *   seats integer not null,
 *   monthly_savings numeric not null,
 *   recommended_plan text,
 *   created_at timestamptz default now()
 * );
 *
 * create table leads (
 *   id uuid primary key default gen_random_uuid(),
 *   audit_id uuid references audits(id) on delete set null,
 *   email text not null,
 *   company_name text,
 *   role text,
 *   team_size integer,
 *   total_monthly_savings numeric,
 *   created_at timestamptz default now()
 * );
 *
 * -- Public read for shareable audit URLs
 * alter table audits enable row level security;
 * create policy "public_read_audits" on audits for select using (true);
 * create policy "service_insert_audits" on audits for insert with check (true);
 *
 * -- Leads private
 * alter table leads enable row level security;
 * create policy "service_only_leads" on leads using (false);
 */
