export interface InsuranceRecord {
  id: string; // yymmdd_[ID HSNV]_ab format
  employee_id: number; // Link to employee
  date_created: Date; // Ngày tháng
  company_unit: string; // Đơn vị
  contract_date?: Date; // Ngày ký HĐLĐ
  id_number?: string; // CMND/Hộ chiếu
  id_issue_date?: Date; // Ngày cấp
  id_issue_place?: string; // Nơi cấp
  cccd_expiry_date?: Date; // Ngày hết hạn CCCD
  household_registration?: string; // Hộ khẩu
  place_of_origin?: string; // Nguyên quán
  tax_code?: string; // MSTCN
  social_insurance_number?: string; // Số sổ BH
  bank_account?: string; // TK Ngân hàng
  bank_name?: string; // Tên Ngân hàng
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed'; // Tình trạng hôn nhân
  number_of_children?: number; // Số con hiện tại
  is_shared: boolean; // Dùng chung
  created_by: number; // ID NV người tạo
  status: 'active' | 'inactive' | 'suspended'; // Trạng thái TT
  notes?: string; // Ghi chú
  created_at: Date;
  updated_at: Date;
}

export interface CreateInsuranceRequest {
  employee_id: number;
  company_unit: string;
  contract_date?: Date;
  id_number?: string;
  id_issue_date?: Date;
  id_issue_place?: string;
  cccd_expiry_date?: Date;
  household_registration?: string;
  place_of_origin?: string;
  tax_code?: string;
  social_insurance_number?: string;
  bank_account?: string;
  bank_name?: string;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  number_of_children?: number;
  is_shared?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  notes?: string;
}

export interface UpdateInsuranceRequest {
  company_unit?: string;
  contract_date?: Date;
  id_number?: string;
  id_issue_date?: Date;
  id_issue_place?: string;
  cccd_expiry_date?: Date;
  household_registration?: string;
  place_of_origin?: string;
  tax_code?: string;
  social_insurance_number?: string;
  bank_account?: string;
  bank_name?: string;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  number_of_children?: number;
  is_shared?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  notes?: string;
}

export interface InsuranceWithEmployee {
  id: string;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  department_name?: string;
  employee_status: string;
  employee_photo_url?: string;
  date_created: Date;
  company_unit: string;
  contract_date?: Date;
  id_number?: string;
  id_issue_date?: Date;
  id_issue_place?: string;
  cccd_expiry_date?: Date;
  household_registration?: string;
  place_of_origin?: string;
  tax_code?: string;
  social_insurance_number?: string;
  bank_account?: string;
  bank_name?: string;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  number_of_children?: number;
  is_shared: boolean;
  created_by: number;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ListInsuranceResponse {
  records: InsuranceWithEmployee[];
  total: number;
}