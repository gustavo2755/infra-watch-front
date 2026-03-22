export function normalizeMonitoringDateInput(
  value: string | null | undefined
): string | null {
  if (!value) return null;
  return value.includes("T") ? value : value.replace(" ", "T");
}

export function parseMonitoringTimestamp(value: string | null | undefined): number {
  const normalized = normalizeMonitoringDateInput(value);

  if (!normalized) return 0;
  const t = new Date(normalized).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function formatMonitoringDateTime(
  value: string | null | undefined
): string {
  if (!value) return "—";
  const normalized = normalizeMonitoringDateInput(value);

  if (!normalized) return "—";
  const d = new Date(normalized);

  if (!Number.isFinite(d.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
