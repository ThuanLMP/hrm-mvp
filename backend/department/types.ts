export interface Department {
  id: number;
  name: string;
  description?: string;
  manager_id?: number;
  manager_name?: string;
  employee_count?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  manager_id?: number;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  manager_id?: number;
}

export interface ListDepartmentsResponse {
  departments: Department[];
  total: number;
}
