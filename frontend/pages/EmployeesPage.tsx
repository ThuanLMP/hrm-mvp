import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit,
  Eye,
  Plus,
  Search,
  User,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { EmployeeDetail } from "../components/employees/EmployeeDetail";
import { EmployeeForm } from "../components/employees/EmployeeForm";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { useBackend } from "../hooks/useBackend";

type SortDirection = "asc" | "desc" | null;
type SortColumn =
  | "employee_code"
  | "full_name"
  | "department_name"
  | "region_name"
  | "position"
  | "status";

function EmployeeList() {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const navigate = useNavigate();
  const backend = useBackend();
  const { user } = useAuth();

  const { data: employees, isLoading } = useQuery({
    queryKey: [
      "employees",
      search,
      departmentFilter,
      regionFilter,
      statusFilter,
    ],
    queryFn: () =>
      backend.employee.list({
        search: search || undefined,
        department_id:
          departmentFilter && departmentFilter !== "all"
            ? parseInt(departmentFilter)
            : undefined,
        region_id:
          regionFilter && regionFilter !== "all"
            ? parseInt(regionFilter)
            : undefined,
        status:
          statusFilter && statusFilter !== "all" ? statusFilter : undefined,
        limit: 100,
      }),
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => backend.department.list(),
  });

  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: () => backend.region.list(),
  });

  const canManageEmployees = user?.role === "admin" || user?.role === "hr";

  // Handle column sorting
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Sort employees data
  const sortedEmployees = useMemo(() => {
    if (!employees?.employees || !sortColumn || !sortDirection) {
      return employees?.employees || [];
    }

    return [...employees.employees].sort((a, b) => {
      let aValue = a[sortColumn] || "";
      let bValue = b[sortColumn] || "";

      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [employees?.employees, sortColumn, sortDirection]);

  // Get sort icon for column
  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="h-4 w-4 text-blue-600" />;
    } else if (sortDirection === "desc") {
      return <ArrowDown className="h-4 w-4 text-blue-600" />;
    }
    return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý nhân viên
          </h1>
          <p className="text-gray-600">Danh sách và thông tin nhân viên</p>
        </div>
        {canManageEmployees && (
          <Button onClick={() => navigate("/employees/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhân viên
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Tìm kiếm và lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã NV..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departments?.departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khu vực</SelectItem>
                {regions?.regions.map((region) => (
                  <SelectItem key={region.id} value={region.id.toString()}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang làm việc</SelectItem>
                <SelectItem value="inactive">Tạm nghỉ</SelectItem>
                <SelectItem value="terminated">Đã nghỉ việc</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setDepartmentFilter("all");
                setRegionFilter("all");
                setStatusFilter("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên ({employees?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">
                    <button
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      onClick={() => handleSort("employee_code")}
                    >
                      Mã NV
                      {getSortIcon("employee_code")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      onClick={() => handleSort("full_name")}
                    >
                      Họ tên
                      {getSortIcon("full_name")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      onClick={() => handleSort("department_name")}
                    >
                      Phòng ban
                      {getSortIcon("department_name")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      onClick={() => handleSort("region_name")}
                    >
                      Khu vực
                      {getSortIcon("region_name")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      onClick={() => handleSort("position")}
                    >
                      Chức vụ
                      {getSortIcon("position")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      Trạng thái
                      {getSortIcon("status")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {employee.employee_code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {employee.photo_url ? (
                          <img
                            src={employee.photo_url}
                            alt={employee.full_name}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                employee.full_name
                              )}&background=3b82f6&color=fff&size=32`;
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <span>{employee.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {employee.department_name || "-"}
                    </td>
                    <td className="py-3 px-4">{employee.region_name || "-"}</td>
                    <td className="py-3 px-4">{employee.position || "-"}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(employee.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/employees/${employee.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManageEmployees && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/employees/${employee.id}/edit`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sortedEmployees.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy nhân viên nào
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EmployeesPage() {
  return (
    <Routes>
      <Route index element={<EmployeeList />} />
      <Route path="new" element={<EmployeeForm />} />
      <Route path=":id" element={<EmployeeDetail />} />
      <Route path=":id/edit" element={<EmployeeForm />} />
    </Routes>
  );
}
