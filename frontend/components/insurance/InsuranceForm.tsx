import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { Employee } from "~backend/employee/types";
import type {
  CreateInsuranceRequest,
  InsuranceWithEmployee,
  UpdateInsuranceRequest,
} from "~backend/insurance/types";

interface InsuranceFormProps {
  record?: InsuranceWithEmployee;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InsuranceForm({
  record,
  onSuccess,
  onCancel,
}: InsuranceFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    employee_id: record?.employee_id || 0,
    company_unit: record?.company_unit || "",
    contract_date: record?.contract_date
      ? new Date(record.contract_date).toISOString().split("T")[0]
      : "",
    id_number: record?.id_number || "",
    id_issue_date: record?.id_issue_date
      ? new Date(record.id_issue_date).toISOString().split("T")[0]
      : "",
    id_issue_place: record?.id_issue_place || "",
    cccd_expiry_date: record?.cccd_expiry_date
      ? new Date(record.cccd_expiry_date).toISOString().split("T")[0]
      : "",
    household_registration: record?.household_registration || "",
    place_of_origin: record?.place_of_origin || "",
    tax_code: record?.tax_code || "",
    social_insurance_number: record?.social_insurance_number || "",
    bank_account: record?.bank_account || "",
    bank_name: record?.bank_name || "",
    marital_status: record?.marital_status || ("single" as const),
    number_of_children: record?.number_of_children || 0,
    is_shared: record?.is_shared || false,
    status: record?.status || ("active" as const),
    notes: record?.notes || "",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await backend.employee.list({ limit: 1000 });
      setEmployees(response.employees);
    } catch (error) {
      console.error("Failed to load employees:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nhân viên",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        contract_date: formData.contract_date
          ? new Date(formData.contract_date)
          : undefined,
        id_issue_date: formData.id_issue_date
          ? new Date(formData.id_issue_date)
          : undefined,
        cccd_expiry_date: formData.cccd_expiry_date
          ? new Date(formData.cccd_expiry_date)
          : undefined,
      };

      if (record) {
        await backend.insurance.update({
          id: record.id,
          ...(data as UpdateInsuranceRequest),
        });
        toast({
          title: "Thành công",
          description: "Cập nhật hồ sơ bảo hiểm thành công",
        });
      } else {
        await backend.insurance.create(data as CreateInsuranceRequest);
        toast({
          title: "Thành công",
          description: "Tạo hồ sơ bảo hiểm thành công",
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving insurance record:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu hồ sơ bảo hiểm",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto">
      <CardHeader>
        <CardTitle>
          {record ? "Chỉnh sửa hồ sơ bảo hiểm" : "Tạo hồ sơ bảo hiểm mới"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Nhân viên *</Label>
              <Select
                value={formData.employee_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, employee_id: parseInt(value) })
                }
                disabled={!!record}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem
                      key={employee.id}
                      value={employee.id.toString()}
                    >
                      {employee.employee_code} - {employee.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_unit">Đơn vị *</Label>
              <Input
                id="company_unit"
                value={formData.company_unit}
                onChange={(e) =>
                  setFormData({ ...formData, company_unit: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_date">Ngày ký HĐLĐ</Label>
              <Input
                id="contract_date"
                type="date"
                value={formData.contract_date}
                onChange={(e) =>
                  setFormData({ ...formData, contract_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_number">CMND/Hộ chiếu</Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) =>
                  setFormData({ ...formData, id_number: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_issue_date">Ngày cấp</Label>
              <Input
                id="id_issue_date"
                type="date"
                value={formData.id_issue_date}
                onChange={(e) =>
                  setFormData({ ...formData, id_issue_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_issue_place">Nơi cấp</Label>
              <Input
                id="id_issue_place"
                value={formData.id_issue_place}
                onChange={(e) =>
                  setFormData({ ...formData, id_issue_place: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cccd_expiry_date">Ngày hết hạn CCCD</Label>
              <Input
                id="cccd_expiry_date"
                type="date"
                value={formData.cccd_expiry_date}
                onChange={(e) =>
                  setFormData({ ...formData, cccd_expiry_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="place_of_origin">Nguyên quán</Label>
              <Input
                id="place_of_origin"
                value={formData.place_of_origin}
                onChange={(e) =>
                  setFormData({ ...formData, place_of_origin: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_code">Mã số thuế cá nhân</Label>
              <Input
                id="tax_code"
                value={formData.tax_code}
                onChange={(e) =>
                  setFormData({ ...formData, tax_code: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_insurance_number">Số sổ bảo hiểm</Label>
              <Input
                id="social_insurance_number"
                value={formData.social_insurance_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_insurance_number: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_account">Tài khoản ngân hàng</Label>
              <Input
                id="bank_account"
                value={formData.bank_account}
                onChange={(e) =>
                  setFormData({ ...formData, bank_account: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_name">Tên ngân hàng</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) =>
                  setFormData({ ...formData, bank_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marital_status">Tình trạng hôn nhân</Label>
              <Select
                value={formData.marital_status}
                onValueChange={(
                  value: "single" | "married" | "divorced" | "widowed"
                ) => setFormData({ ...formData, marital_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Độc thân</SelectItem>
                  <SelectItem value="married">Đã kết hôn</SelectItem>
                  <SelectItem value="divorced">Đã ly hôn</SelectItem>
                  <SelectItem value="widowed">Góa bụa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="number_of_children">Số con hiện tại</Label>
              <Input
                id="number_of_children"
                type="number"
                min="0"
                value={formData.number_of_children}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    number_of_children: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive" | "suspended") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngưng hoạt động</SelectItem>
                  <SelectItem value="suspended">Tạm ngưng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="household_registration">Hộ khẩu</Label>
            <Textarea
              id="household_registration"
              value={formData.household_registration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  household_registration: e.target.value,
                })
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_shared"
              checked={formData.is_shared}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_shared: !!checked })
              }
            />
            <Label htmlFor="is_shared">Dùng chung</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
