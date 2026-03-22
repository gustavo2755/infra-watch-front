import type { Server, ServerCreate, ServerUpdate, ServerCollection } from "../types/server";
import type { ApiSuccess, PaginationParams } from "../types/api";
import { request } from "./api/client";

export const serverService = {
  async list(params?: PaginationParams & {
    name?: string;
    is_active?: boolean;
  }): Promise<ApiSuccess<ServerCollection>> {
    const search = new URLSearchParams();

    if (params?.name) search.set("name", params.name);
    if (params?.is_active !== undefined) search.set("is_active", String(params.is_active ? 1 : 0));
    if (params?.page !== undefined) search.set("page", String(params.page));
    if (params?.per_page !== undefined) search.set("per_page", String(params.per_page));
    const query = search.toString();
    const path = `/api/servers${query ? `?${query}` : ""}`;
    return request<ApiSuccess<ServerCollection>>(path);
  },

  async getById(id: number): Promise<ApiSuccess<Server>> {
    return request<ApiSuccess<Server>>(`/api/servers/${id}`);
  },

  async create(data: ServerCreate): Promise<ApiSuccess<Server>> {
    return request<ApiSuccess<Server>>("/api/servers", {
      method: "POST",
      body: data,
    });
  },

  async update(id: number, data: ServerUpdate): Promise<ApiSuccess<Server>> {
    return request<ApiSuccess<Server>>(`/api/servers/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id: number): Promise<ApiSuccess<null>> {
    return request<ApiSuccess<null>>(`/api/servers/${id}`, {
      method: "DELETE",
    });
  },
};
