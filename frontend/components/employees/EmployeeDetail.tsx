import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Edit,
  Map,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useBackend } from "../../hooks/useBackend";
import {
  calculateWorkDuration,
  formatDisplayDate,
  getWorkStatus,
} from "../../utils/workDurationHelpers";
import { InsuranceDetailModal } from "../insurance/InsuranceDetailModal";
import { LoadingSpinner } from "../ui/LoadingSpinner";

export function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backend = useBackend();
  const { user } = useAuth();
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<string | null>(
    null
  );
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);

  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => backend.employee.get({ id: parseInt(id!) }),
    enabled: Boolean(id),
  });

  const { data: insuranceData, isLoading: insuranceLoading } = useQuery({
    queryKey: ["employee-insurance", id],
    queryFn: () => backend.insurance.list({ employee_id: parseInt(id!) }),
    enabled: Boolean(id),
  });

  const canEdit = user?.role === "admin" || user?.role === "hr";

  const handleViewInsuranceDetail = (insuranceId: string) => {
    setSelectedInsuranceId(insuranceId);
    setIsInsuranceModalOpen(true);
  };

  const handleCloseInsuranceModal = () => {
    setIsInsuranceModalOpen(false);
    setSelectedInsuranceId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy nhân viên</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      terminated: "destructive",
    } as const;

    const labels = {
      active: "Đang làm việc",
      inactive: "Tạm nghỉ",
      terminated: "Đã nghỉ việc",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/employees")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết nhân viên
            </h1>
            <p className="text-gray-600">{employee.employee_code}</p>
          </div>
        </div>

        {canEdit && (
          <Button onClick={() => navigate(`/employees/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {employee.photo_url ? (
                  <img
                    src={employee.photo_url}
                    alt={employee.full_name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        employee.full_name
                      )}&background=3b82f6&color=fff&size=96`;
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <h3 className="text-xl font-bold">{employee.full_name}</h3>
                <p className="text-gray-600">{employee.employee_code}</p>
                {getStatusBadge(employee.status)}
              </div>

              <div className="space-y-3 mt-6">
                {employee.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                )}

                {employee.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-sm">{employee.address}</span>
                  </div>
                )}

                {employee.date_of_birth && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      Sinh ngày: {formatDate(employee.date_of_birth as any)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Thông tin công việc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Ngày vào làm</Label>
                    <p className="font-medium">
                      {formatDate(employee.hire_date as any)}
                    </p>
                  </div>

                  <div>
                    <Label>Ngày nghỉ việc</Label>
                    <p
                      className={`font-medium ${
                        employee.termination_date
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {employee.termination_date
                        ? formatDisplayDate(employee.termination_date)
                        : "Chưa nghỉ việc"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Thời gian làm việc</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {calculateWorkDuration(
                          employee.hire_date,
                          employee.termination_date
                        )}
                      </p>
                      <Badge
                        variant={
                          employee.termination_date ? "secondary" : "default"
                        }
                      >
                        {getWorkStatus(employee.termination_date)}
                      </Badge>
                    </div>
                  </div>

                  {employee.position && (
                    <div>
                      <Label>Chức vụ</Label>
                      <p className="font-medium">{employee.position}</p>
                    </div>
                  )}

                  {employee.department_name && (
                    <div>
                      <Label>Phòng ban</Label>
                      <p className="font-medium flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        {employee.department_name}
                      </p>
                    </div>
                  )}

                  {employee.region_name && (
                    <div>
                      <Label>Khu vực</Label>
                      <p className="font-medium flex items-center">
                        <Map className="h-4 w-4 mr-2" />
                        {employee.region_name}
                      </p>
                    </div>
                  )}

                  {employee.salary && (
                    <div>
                      <Label>Lương</Label>
                      <p className="font-medium text-green-600">
                        {formatCurrency(employee.salary)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Insurance Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Thông tin bảo hiểm
                  </div>
                  {(!insuranceData?.records ||
                    insuranceData.records.length === 0) &&
                    canEdit && (
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(`/insurance/create?employee_id=${id}`)
                        }
                      >
                        Tạo ngay
                      </Button>
                    )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insuranceLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner />
                  </div>
                ) : insuranceData?.records &&
                  insuranceData.records.length > 0 ? (
                  <div className="space-y-4">
                    {insuranceData.records.map((insurance) => (
                      <div key={insurance.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Mã hồ sơ</Label>
                            <p className="font-medium">{insurance.id}</p>
                          </div>
                          <div>
                            <Label>Đơn vị</Label>
                            <p className="font-medium">
                              {insurance.company_unit}
                            </p>
                          </div>
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
                              <Label>Mã số thuế</Label>
                              <p className="font-medium">
                                {insurance.tax_code}
                              </p>
                            </div>
                          )}
                          {insurance.id_number && (
                            <div>
                              <Label>CMND/CCCD</Label>
                              <p className="font-medium">
                                {insurance.id_number}
                              </p>
                            </div>
                          )}
                          <div>
                            <Label>Trạng thái</Label>
                            <Badge
                              variant={
                                insurance.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {insurance.status === "active"
                                ? "Đang hoạt động"
                                : insurance.status === "inactive"
                                ? "Không hoạt động"
                                : "Tạm ngưng"}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleViewInsuranceDetail(insurance.id)
                            }
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">
                      Chưa có thông tin bảo hiểm
                    </p>
                    <p className="text-sm mb-4">
                      Nhân viên này chưa có hồ sơ bảo hiểm nào
                    </p>
                    {canEdit && (
                      <Button
                        onClick={() =>
                          navigate(`/insurance/create?employee_id=${id}`)
                        }
                      >
                        Tạo hồ sơ bảo hiểm
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <p className="text-sm text-gray-600">
                      Ngày nghỉ phép đã dùng
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">22</div>
                    <p className="text-sm text-gray-600">
                      Ngày làm việc tháng này
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">2</div>
                    <p className="text-sm text-gray-600">
                      Lần đi muộn tháng này
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Insurance Detail Modal */}
      <InsuranceDetailModal
        insuranceId={selectedInsuranceId}
        isOpen={isInsuranceModalOpen}
        onClose={handleCloseInsuranceModal}
      />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500 mb-1">{children}</p>;
}
