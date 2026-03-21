import type {
  ServiceCheck,
  ServiceCheckCreate,
  ServiceCheckUpdate,
  ServiceCheckCollection,
} from "../types/serviceCheck";
import type { ApiSuccess } from "../types/api";
import { request } from "./api/client";

export const serviceCheckService = {
  async list(): Promise<ApiSuccess<ServiceCheckCollection>> {
    return request<ApiSuccess<ServiceCheckCollection>>("/api/service-checks");
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
    serverId: number
  ): Promise<ApiSuccess<ServiceCheckCollection>> {
    return request<ApiSuccess<ServiceCheckCollection>>(
      `/api/servers/${serverId}/service-checks/available`
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
