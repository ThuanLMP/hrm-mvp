import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useState } from "react";

// Mock data for demo
const mockEmployees = [
  {
    id: 1,
    employee_code: "NV001",
    full_name: "Nguyễn Văn An",
    department_name: "IT",
    position: "Developer",
    photo_url: null,
  },
  {
    id: 2,
    employee_code: "NV002",
    full_name: "Trần Thị Bình",
    department_name: "HR",
    position: "HR Manager",
    photo_url: null,
  },
  {
    id: 3,
    employee_code: "NV003",
    full_name: "Lê Văn Cường",
    department_name: "Finance",
    position: "Accountant",
    photo_url: null,
  },
  {
    id: 4,
    employee_code: "NV004",
    full_name: "Phạm Thị Dung",
    department_name: "Marketing",
    position: "Marketing Specialist",
    photo_url: null,
  },
  {
    id: 5,
    employee_code: "NV005",
    full_name: "Hoàng Văn Em",
    department_name: "IT",
    position: "Senior Developer",
    photo_url: null,
  },
];

export function EmployeeNameDemo() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const handleNameClick = (employeeName: string) => {
    setSelectedEmployee(employeeName);
    console.log(`Clicked on employee: ${employeeName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Demo hiệu ứng tên nhân viên</h1>
        <p className="text-gray-600">
          Tên nhân viên có màu xanh, hiệu ứng hover và click để xem chi tiết
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Hiệu ứng cơ bản</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Tên nhân viên với hiệu ứng hover và click:
              </p>
              <div className="space-y-2">
                {mockEmployees.slice(0, 3).map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <button
                      onClick={() => handleNameClick(employee.full_name)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
                    >
                      {employee.full_name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Hiệu ứng nâng cao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Tên nhân viên với hiệu ứng hover phức tạp hơn:
              </p>
              <div className="space-y-2">
                {mockEmployees.slice(3).map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <button
                      onClick={() => handleNameClick(employee.full_name)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-all duration-200 hover:scale-105 cursor-pointer hover:shadow-md hover:bg-blue-50 px-2 py-1 rounded"
                    >
                      {employee.full_name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Demo tương tác</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Click vào tên nhân viên để xem hiệu ứng:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={() => handleNameClick(employee.full_name)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-all duration-200 hover:scale-105 cursor-pointer text-left"
                    >
                      {employee.full_name}
                    </button>
                    <p className="text-sm text-gray-500">{employee.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSS Classes Demo */}
      <Card>
        <CardHeader>
          <CardTitle>CSS Classes được sử dụng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Classes chính:</h4>
              <div className="bg-gray-100 p-4 rounded-lg">
                <code className="text-sm">
                  {`text-blue-600 hover:text-blue-800 hover:underline font-medium transition-all duration-200 hover:scale-105 cursor-pointer`}
                </code>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Màu sắc:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      text-blue-600
                    </code>{" "}
                    - Màu xanh mặc định
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      hover:text-blue-800
                    </code>{" "}
                    - Màu xanh đậm khi hover
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Hiệu ứng:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      hover:underline
                    </code>{" "}
                    - Gạch chân khi hover
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      hover:scale-105
                    </code>{" "}
                    - Phóng to 5% khi hover
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      transition-all duration-200
                    </code>{" "}
                    - Chuyển đổi mượt mà
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Employee Display */}
      {selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle>Nhân viên được chọn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-lg">{selectedEmployee}</h3>
                <p className="text-gray-600">Đã click vào tên nhân viên</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
