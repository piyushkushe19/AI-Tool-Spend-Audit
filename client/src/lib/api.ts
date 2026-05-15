import type { AuditInput, AuditResult } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export async function runAudit(input: AuditInput): Promise<AuditResult> {
  const res = await fetch(`${API_BASE}/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? "Audit failed");
  return data.data as AuditResult;
}

export async function fetchAudit(id: string): Promise<AuditResult> {
  const res = await fetch(`${API_BASE}/audit/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? "Audit not found");
  return data.data as AuditResult;
}

export async function saveLead(payload: {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? "Failed to save");
}
