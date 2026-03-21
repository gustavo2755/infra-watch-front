import type { ServiceCheck } from "./serviceCheck";

export interface Server {
  id: number;
  name: string;
  description: string | null;
  ip_address: string;
  is_active: boolean;
  monitor_resources: boolean;
  cpu_total: number | null;
  ram_total: number | null;
  disk_total: number | null;
  check_interval_seconds: number | null;
  last_check_at: string | null;
  retention_days: number | null;
  cpu_alert_threshold: number | null;
  ram_alert_threshold: number | null;
  disk_alert_threshold: number | null;
  bandwidth_alert_threshold: number | null;
  alert_cpu_enabled: boolean;
  alert_ram_enabled: boolean;
  alert_disk_enabled: boolean;
  alert_bandwidth_enabled: boolean;
  created_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  service_checks?: ServiceCheck[];
}

export interface ServerCreate {
  name: string;
  ip_address: string;
  description?: string | null;
  is_active: boolean;
  monitor_resources: boolean;
  cpu_total: number;
  ram_total: number;
  disk_total: number;
  check_interval_seconds: number;
  last_check_at?: string | null;
  retention_days: number;
  cpu_alert_threshold: number;
  ram_alert_threshold: number;
  disk_alert_threshold: number;
  bandwidth_alert_threshold: number;
  alert_cpu_enabled: boolean;
  alert_ram_enabled: boolean;
  alert_disk_enabled: boolean;
  alert_bandwidth_enabled: boolean;
}

export type ServerUpdate = Partial<ServerCreate>;

export interface ServerCollection {
  data: Server[];
  count: number;
}
