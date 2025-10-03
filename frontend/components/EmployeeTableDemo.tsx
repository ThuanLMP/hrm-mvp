import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EDUCATION_LEVELS } from "@/constants/education";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit,
  Eye,
  Search,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";

// Mock data for demo
const mockEmployees = [
  {
    id: 1,
    employee_code: "NV001",
    full_name: "Nguyễn Văn An",
    department_name: "IT",
    region_name: "Hà Nội",
    position: "Developer",
    status: "active",
    salary: 15000000,
    hire_date: "2023-01-15",
    education_level: "university",
    phone: "0123456789",
    photo_url: null,
  },
  {
    id: 2,
    employee_code: "NV002",
    full_name: "Trần Thị Bình",
    department_name: "HR",
    region_name: "TP.HCM",
    position: "HR Manager",
    status: "active",
    salary: 20000000,
    hire_date: "2022-06-01",
    education_level: "master",
    phone: "0987654321",
    photo_url: null,
  },
  {
    id: 3,
    employee_code: "NV003",
    full_name: "Lê Văn Cường",
    department_name: "Finance",
    region_name: "Đà Nẵng",
    position: "Accountant",
    status: "inactive",
    salary: 12000000,
    hire_date: "2023-03-10",
    education_level: "college",
    phone: "0369852147",
    photo_url: null,
  },
  {
    id: 4,
    employee_code: "NV004",
    full_name: "Phạm Thị Dung",
    department_name: "Marketing",
    region_name: "Hà Nội",
    position: "Marketing Specialist",
    status: "active",
    salary: 18000000,
    hire_date: "2022-12-05",
    education_level: "university",
    phone: "0741258963",
    photo_url: null,
  },
  {
    id: 5,
    employee_code: "NV005",
    full_name: "Hoàng Văn Em",
    department_name: "IT",
    region_name: "TP.HCM",
    position: "Senior Developer",
    status: "terminated",
    salary: 25000000,
    hire_date: "2021-08-20",
    education_level: "phd",
    phone: "0852369741",
    photo_url: null,
  },
];

type SortDirection = "asc" | "desc" | null;
type SortColumn =
  | "employee_code"
  | "full_name"
  | "department_name"
  | "region_name"
  | "position"
  | "status"
  | "salary"
  | "hire_date"
  | "education_level"
  | "phone";

export function EmployeeTableDemo() {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [educationFilter, setEducationFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle column sorting
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
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

  // Filter and sort employees
  const filteredEmployees = mockEmployees.filter((employee) => {
    const matchesSearch =
      employee.full_name.toLowerCase().includes(search.toLowerCase()) ||
      employee.employee_code.toLowerCase().includes(search.toLowerCase());

    const matchesDepartment =
      departmentFilter === "all" ||
      employee.department_name === departmentFilter;

    const matchesRegion =
      regionFilter === "all" || employee.region_name === regionFilter;

    const matchesStatus =
      statusFilter === "all" || employee.status === statusFilter;

    const matchesEducation =
      educationFilter === "all" || employee.education_level === educationFilter;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesRegion &&
      matchesStatus &&
      matchesEducation
    );
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;

    let aValue = a[sortColumn] || "";
    let bValue = b[sortColumn] || "";

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

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
      <div>
        <h1 className="text-2xl font-bold mb-2">
          Bảng nhân viên với các trường mới
        </h1>
        <p className="text-gray-600">
          Demo bảng quản lý nhân viên với các trường: Lương, Ngày vào làm, Trình
          độ học vấn, Số điện thoại
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Tìm kiếm và lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã NV..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả phòng ban</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
            </select>

            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả khu vực</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP.HCM">TP.HCM</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang làm việc</option>
              <option value="inactive">Tạm nghỉ</option>
              <option value="terminated">Đã nghỉ việc</option>
            </select>

            <select
              value={educationFilter}
              onChange={(e) => setEducationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trình độ</option>
              {Object.entries(EDUCATION_LEVELS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setDepartmentFilter("all");
                setRegionFilter("all");
                setStatusFilter("all");
                setEducationFilter("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên ({sortedEmployees.length})</CardTitle>
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
                  <th className="text-left py-3 px-4">
                    <button
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      onClick={() => handleSort("salary")}
                    >
                      Lương
                      {getSortIcon("salary")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      onClick={() => handleSort("hire_date")}
                    >
                      Ngày vào làm
                      {getSortIcon("hire_date")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      onClick={() => handleSort("education_level")}
                    >
                      Trình độ
                      {getSortIcon("education_level")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      onClick={() => handleSort("phone")}
                    >
                      SĐT
                      {getSortIcon("phone")}
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
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <button
                          onClick={() =>
                            console.log(
                              `Viewing details for ${employee.full_name}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
                        >
                          {employee.full_name}
                        </button>
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
                      {employee.salary ? formatCurrency(employee.salary) : "-"}
                    </td>
                    <td className="py-3 px-4">
                      {employee.hire_date
                        ? formatDate(employee.hire_date)
                        : "-"}
                    </td>
                    <td className="py-3 px-4">
                      {employee.education_level
                        ? EDUCATION_LEVELS[
                            employee.education_level as keyof typeof EDUCATION_LEVELS
                          ]
                        : "-"}
                    </td>
                    <td className="py-3 px-4">{employee.phone || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Tính năng mới</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Các trường mới được thêm:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  <strong>Lương:</strong> Hiển thị mức lương với định dạng tiền
                  tệ VNĐ
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <strong>Ngày vào làm:</strong> Hiển thị ngày bắt đầu làm việc
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  <strong>Trình độ học vấn:</strong> Hiển thị trình độ với label
                  tiếng Việt
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  <strong>Số điện thoại:</strong> Hiển thị số liên lạc
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Tính năng sắp xếp:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Sắp xếp theo tất cả các trường mới
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Sắp xếp số (lương) theo thứ tự tăng/giảm
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Sắp xếp ngày tháng theo thứ tự thời gian
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Lọc theo trình độ học vấn
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
