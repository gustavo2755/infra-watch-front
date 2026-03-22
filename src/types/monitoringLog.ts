import type { ServiceCheck } from "./serviceCheck";

export interface MonitoringLog {
  id: number;
  server_id: number;
  checked_at: string | null;
  is_up: boolean;
  cpu_usage_percent: number | null;
  ram_usage_percent: number | null;
  disk_usage_percent: number | null;
  bandwidth_usage_percent: number | null;
  is_alert: boolean;
  alert_type: string | null;
  error_message: string | null;
  sent_to_email: string | null;
  created_at: string | null;
  updated_at: string | null;
  service_checks?: ServiceCheck[];
}

export type MonitoringLogCollection = import("./api").PaginatedCollection<MonitoringLog>;
