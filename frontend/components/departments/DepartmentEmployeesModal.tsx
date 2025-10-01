import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface Employee {
  id: number;
  full_name: string;
  employee_code: string;
  email?: string;
  phone?: string;
  position?: string;
  hire_date: string;
  status: "active" | "inactive" | "terminated";
  address?: string;
  photo_url?: string;
}

interface DepartmentEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: {
    id: number;
    name: string;
    description?: string;
  } | null;
  employees: Employee[];
  isLoading: boolean;
}

export function DepartmentEmployeesModal({
  isOpen,
  onClose,
  department,
  employees,
  isLoading,
}: DepartmentEmployeesModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "terminated":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang làm việc";
      case "inactive":
        return "Tạm nghỉ";
      case "terminated":
        return "Đã nghỉ việc";
      default:
        return "Không xác định";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const activeEmployees = employees.filter((emp) => emp.status === "active");
  const inactiveEmployees = employees.filter(
    (emp) => emp.status === "inactive"
  );
  const terminatedEmployees = employees.filter(
    (emp) => emp.status === "terminated"
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl min-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Nhân viên phòng ban: {department?.name}
          </DialogTitle>
          {department?.description && (
            <p className="text-sm text-gray-600 mt-1">
              {department.description}
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Thống kê tổng quan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <UserCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Đang làm việc</p>
                        <p className="text-2xl font-bold text-green-600">
                          {activeEmployees.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <UserX className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tạm nghỉ</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {inactiveEmployees.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <UserX className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Đã nghỉ việc</p>
                        <p className="text-2xl font-bold text-red-600">
                          {terminatedEmployees.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Danh sách nhân viên */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Danh sách nhân viên ({employees.length})
                </h3>

                {employees.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">
                        Chưa có nhân viên nào trong phòng ban này
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {employees.map((employee) => (
                      <Card
                        key={employee.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 flex-shrink-0">
                              {employee.photo_url ? (
                                <img
                                  src={employee.photo_url}
                                  alt={employee.full_name}
                                  className="h-16 w-16 rounded-full object-cover"
                                />
                              ) : (
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                                  {getInitials(employee.full_name)}
                                </AvatarFallback>
                              )}
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {employee.full_name}
                                </h4>
                                <Badge
                                  className={`text-sm px-3 py-1 ${getStatusColor(
                                    employee.status
                                  )}`}
                                >
                                  {getStatusText(employee.status)}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-500">
                                    Mã NV:
                                  </span>
                                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                    {employee.employee_code}
                                  </span>
                                </div>

                                {employee.position && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-500">
                                      Chức vụ:
                                    </span>
                                    <span>{employee.position}</span>
                                  </div>
                                )}

                                {employee.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="truncate">
                                      {employee.email}
                                    </span>
                                  </div>
                                )}

                                {employee.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span>{employee.phone}</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>
                                    Ngày vào:{" "}
                                    {new Date(
                                      employee.hire_date
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>

                                {employee.address && (
                                  <div className="flex items-center gap-2 col-span-full">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="truncate">
                                      {employee.address}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
