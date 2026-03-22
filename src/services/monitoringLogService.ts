import type { MonitoringLog, MonitoringLogCollection } from "../types/monitoringLog";
import type { ApiSuccess, PaginationParams } from "../types/api";
import { request } from "./api/client";

export const monitoringLogService = {
  async list(params?: PaginationParams & {
    server_id?: number;
    from?: string;
    to?: string;
    alerts_only?: boolean;
  }): Promise<ApiSuccess<MonitoringLogCollection>> {
    const search = new URLSearchParams();

    if (params?.server_id !== undefined) search.set("server_id", String(params.server_id));
    if (params?.from) search.set("from", params.from);
    if (params?.to) search.set("to", params.to);
    if (params?.alerts_only !== undefined) search.set("alerts_only", params.alerts_only ? "1" : "0");
    if (params?.page !== undefined) search.set("page", String(params.page));
    if (params?.per_page !== undefined) search.set("per_page", String(params.per_page));
    const query = search.toString();
    return request<ApiSuccess<MonitoringLogCollection>>(
      `/api/monitoring-logs${query ? `?${query}` : ""}`
    );
  },

  async getById(id: number): Promise<ApiSuccess<MonitoringLog>> {
    return request<ApiSuccess<MonitoringLog>>(`/api/monitoring-logs/${id}`);
  },

  async listByServer(
    serverId: number,
    params?: PaginationParams
  ): Promise<ApiSuccess<MonitoringLogCollection>> {
    const search = new URLSearchParams();

    if (params?.page !== undefined) search.set("page", String(params.page));
    if (params?.per_page !== undefined) search.set("per_page", String(params.per_page));
    const query = search.toString();
    return request<ApiSuccess<MonitoringLogCollection>>(
      `/api/servers/${serverId}/monitoring-logs${query ? `?${query}` : ""}`
    );
  },

  async dashboard(
    serverId: number,
    params?: PaginationParams
  ): Promise<ApiSuccess<MonitoringLogCollection>> {
    const search = new URLSearchParams();

    if (params?.page !== undefined) search.set("page", String(params.page));
    if (params?.per_page !== undefined) search.set("per_page", String(params.per_page));
    const query = search.toString();
    return request<ApiSuccess<MonitoringLogCollection>>(
      `/api/servers/${serverId}/monitoring-logs/dashboard${query ? `?${query}` : ""}`
    );
  },
};
