export interface BonusType {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bonus {
  id: number;
  employeeId: number;
  employeeName?: string;
  employeeCode?: string;
  bonusTypeId: number;
  bonusTypeName?: string;
  bonusTypeIcon?: string;
  bonusTypeColor?: string;
  title: string;
  description?: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  awardDate: Date;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdBy?: number;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBonusRequest {
  employeeId: number;
  bonusTypeId: number;
  title: string;
  description?: string;
  amount: number;
  awardDate: Date;
}

export interface UpdateBonusRequest {
  title?: string;
  description?: string;
  amount?: number;
  awardDate?: Date;
  bonusTypeId?: number;
}

export interface ApproveBonusRequest {
  approvedBy: number;
}

export interface RejectBonusRequest {
  rejectionReason: string;
}

export interface ListBonusesRequest {
  limit?: number;
  offset?: number;
  employeeId?: number;
  bonusTypeId?: number;
  status?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ListBonusesResponse {
  bonuses: Bonus[];
  total: number;
}

export interface ListBonusTypesResponse {
  bonusTypes: BonusType[];
}

export interface BonusStats {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  monthlyGrowth: number;
}