export interface ServiceCheck {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ServiceCheckCreate {
  name: string;
  slug: string;
  description?: string | null;
}

export interface ServiceCheckUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
}

export type ServiceCheckCollection = import("./api").PaginatedCollection<ServiceCheck>;
