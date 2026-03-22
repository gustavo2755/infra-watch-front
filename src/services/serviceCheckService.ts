import type {
  ServiceCheck,
  ServiceCheckCreate,
  ServiceCheckUpdate,
  ServiceCheckCollection,
} from "../types/serviceCheck";
import type { ApiSuccess, PaginationParams } from "../types/api";
import { request } from "./api/client";

export const serviceCheckService = {
  async list(params?: PaginationParams): Promise<ApiSuccess<ServiceCheckCollection>> {
    const search = new URLSearchParams();

    if (params?.page != null) search.set("page", String(params.page));
    if (params?.per_page != null) search.set("per_page", String(params.per_page));
    const query = search.toString();
    const path = `/api/service-checks${query ? `?${query}` : ""}`;
    return request<ApiSuccess<ServiceCheckCollection>>(path);
  },

  async getById(id: number): Promise<ApiSuccess<ServiceCheck>> {
    return request<ApiSuccess<ServiceCheck>>(`/api/service-checks/${id}`);
  },

  async getBySlug(slug: string): Promise<ApiSuccess<ServiceCheck>> {
    return request<ApiSuccess<ServiceCheck>>(`/api/service-checks/slug/${slug}`);
  },

  async create(data: ServiceCheckCreate): Promise<ApiSuccess<ServiceCheck>> {
    return request<ApiSuccess<ServiceCheck>>("/api/service-checks", {
      method: "POST",
      body: data,
    });
  },

  async update(
    id: number,
    data: ServiceCheckUpdate
  ): Promise<ApiSuccess<ServiceCheck>> {
    return request<ApiSuccess<ServiceCheck>>(`/api/service-checks/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id: number): Promise<ApiSuccess<null>> {
    return request<ApiSuccess<null>>(`/api/service-checks/${id}`, {
      method: "DELETE",
    });
  },

  async attachToServer(
    serverId: number,
    serviceCheckId: number
  ): Promise<ApiSuccess<null>> {
    return request<ApiSuccess<null>>(
      `/api/servers/${serverId}/service-checks/${serviceCheckId}`,
      { method: "POST" }
    );
  },

  async getAvailableForServer(
    serverId: number,
    params?: PaginationParams
  ): Promise<ApiSuccess<ServiceCheckCollection>> {
    const search = new URLSearchParams();

    if (params?.page !== undefined) search.set("page", String(params.page));
    if (params?.per_page !== undefined) search.set("per_page", String(params.per_page));
    const query = search.toString();
    return request<ApiSuccess<ServiceCheckCollection>>(
      `/api/servers/${serverId}/service-checks/available${query ? `?${query}` : ""}`
    );
  },

  async detachFromServer(
    serverId: number,
    serviceCheckId: number
  ): Promise<ApiSuccess<null>> {
    return request<ApiSuccess<null>>(
      `/api/servers/${serverId}/service-checks/${serviceCheckId}`,
      { method: "DELETE" }
    );
  },
};
