export interface Region {
  id: number;
  name: string;
  code: string;
  description?: string;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRegionRequest {
  name: string;
  code: string;
  description?: string;
  timezone?: string;
}

export interface UpdateRegionRequest {
  name?: string;
  code?: string;
  description?: string;
  timezone?: string;
  isActive?: boolean;
}