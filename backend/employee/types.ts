export interface Employee {
  id: number;
  user_id?: number;
  employee_code: string;
  full_name: string;
  phone?: string;
  address?: string;
  date_of_birth?: Date;
  hire_date: Date;
  termination_date?: Date;
  position?: string;
  department_id?: number;
  department_name?: string;
  region_id?: number;
  region_name?: string;
  salary?: number;
  status: "active" | "inactive" | "terminated";
  photo_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEmployeeRequest {
  email?: string;
  password?: string;
  role?: string;
  employee_code: string;
  full_name: string;
  phone?: string;
  address?: string;
  date_of_birth?: Date;
  hire_date: Date;
  termination_date?: Date;
  position?: string;
  department_id?: number;
  region_id?: number;
  salary?: number;
  status?: "active" | "inactive" | "terminated";
  photo_url?: string;
}

export interface UpdateEmployeeRequest {
  full_name?: string;
  phone?: string;
  address?: string;
  date_of_birth?: Date;
  termination_date?: Date;
  position?: string;
  department_id?: number;
  region_id?: number;
  salary?: number;
  status?: "active" | "inactive" | "terminated";
  photo_url?: string;
}

export interface ListEmployeesResponse {
  employees: Employee[];
  total: number;
}
