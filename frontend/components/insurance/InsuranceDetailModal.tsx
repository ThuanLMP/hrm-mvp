import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Building2, CreditCard, FileText, User } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";

interface InsuranceDetailModalProps {
  insuranceId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InsuranceDetailModal({
  insuranceId,
  isOpen,
  onClose,
}: InsuranceDetailModalProps) {
  const backend = useBackend();

  const { data: insurance, isLoading } = useQuery({
    queryKey: ["insurance-detail", insuranceId],
    queryFn: () => backend.insurance.get({ id: insuranceId! }),
    enabled: Boolean(insuranceId) && isOpen,
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "inactive":
        return "Không hoạt động";
      case "suspended":
        return "Tạm ngưng";
      default:
        return status;
    }
  };

  const getMaritalStatusText = (status: string) => {
    switch (status) {
      case "single":
        return "Độc thân";
      case "married":
        return "Đã kết hôn";
      case "divorced":
        return "Đã ly hôn";
      case "widowed":
        return "Góa phụ";
      default:
        return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Chi tiết hồ sơ bảo hiểm
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : insurance ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mã hồ sơ</Label>
                  <p className="font-medium">{insurance.id}</p>
                </div>
                <div>
                  <Label>Nhân viên</Label>
                  <p className="font-medium">{insurance.employee_name}</p>
                </div>
                <div>
                  <Label>Mã nhân viên</Label>
                  <p className="font-medium">{insurance.employee_code}</p>
                </div>
                <div>
                  <Label>Phòng ban</Label>
                  <p className="font-medium">
                    {insurance.department_name || "Chưa có"}
                  </p>
                </div>
                <div>
                  <Label>Đơn vị</Label>
                  <p className="font-medium">{insurance.company_unit}</p>
                </div>
                <div>
                  <Label>Ngày tạo</Label>
                  <p className="font-medium">
                    {formatDate(insurance.date_created)}
                  </p>
                </div>
                {insurance.contract_date && (
                  <div>
                    <Label>Ngày ký HĐLĐ</Label>
                    <p className="font-medium">
                      {formatDate(insurance.contract_date)}
                    </p>
                  </div>
                )}
                <div>
                  <Label>Trạng thái</Label>
                  <Badge
                    variant={
                      insurance.status === "active" ? "default" : "secondary"
                    }
                  >
                    {getStatusText(insurance.status)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insurance.id_number && (
                  <div>
                    <Label>CMND/CCCD</Label>
                    <p className="font-medium">{insurance.id_number}</p>
                  </div>
                )}
                {insurance.id_issue_date && (
                  <div>
                    <Label>Ngày cấp</Label>
                    <p className="font-medium">
                      {formatDate(insurance.id_issue_date)}
                    </p>
                  </div>
                )}
                {insurance.id_issue_place && (
                  <div>
                    <Label>Nơi cấp</Label>
                    <p className="font-medium">{insurance.id_issue_place}</p>
                  </div>
                )}
                {insurance.cccd_expiry_date && (
                  <div>
                    <Label>Ngày hết hạn CCCD</Label>
                    <p className="font-medium">
                      {formatDate(insurance.cccd_expiry_date)}
                    </p>
                  </div>
                )}
                {insurance.household_registration && (
                  <div>
                    <Label>Hộ khẩu</Label>
                    <p className="font-medium">
                      {insurance.household_registration}
                    </p>
                  </div>
                )}
                {insurance.place_of_origin && (
                  <div>
                    <Label>Nguyên quán</Label>
                    <p className="font-medium">{insurance.place_of_origin}</p>
                  </div>
                )}
                {insurance.marital_status && (
                  <div>
                    <Label>Tình trạng hôn nhân</Label>
                    <p className="font-medium">
                      {getMaritalStatusText(insurance.marital_status)}
                    </p>
                  </div>
                )}
                {insurance.number_of_children !== undefined && (
                  <div>
                    <Label>Số con</Label>
                    <p className="font-medium">
                      {insurance.number_of_children}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Insurance & Tax Information */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Thông tin bảo hiểm & thuế
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insurance.social_insurance_number && (
                  <div>
                    <Label>Số sổ bảo hiểm</Label>
                    <p className="font-medium">
                      {insurance.social_insurance_number}
                    </p>
                  </div>
                )}
                {insurance.tax_code && (
                  <div>
                    <Label>Mã số thuế cá nhân</Label>
                    <p className="font-medium">{insurance.tax_code}</p>
                  </div>
                )}
                {insurance.bank_account && (
                  <div>
                    <Label>Tài khoản ngân hàng</Label>
                    <p className="font-medium">{insurance.bank_account}</p>
                  </div>
                )}
                {insurance.bank_name && (
                  <div>
                    <Label>Tên ngân hàng</Label>
                    <p className="font-medium">{insurance.bank_name}</p>
                  </div>
                )}
                <div>
                  <Label>Dùng chung</Label>
                  <Badge
                    variant={insurance.is_shared ? "default" : "secondary"}
                  >
                    {insurance.is_shared ? "Có" : "Không"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Notes */}
            {insurance.notes && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Ghi chú</h3>
                <p className="text-gray-700">{insurance.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
              <Button
                onClick={() =>
                  window.open(`/insurance/${insurance.id}`, "_blank")
                }
              >
                Mở trang chi tiết
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Không tìm thấy thông tin bảo hiểm</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
