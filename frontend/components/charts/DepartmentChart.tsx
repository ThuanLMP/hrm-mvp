interface DepartmentData {
  name: string;
  total_employees: number;
  present_today: number;
  attendance_rate: number;
}

interface DepartmentChartProps {
  data: DepartmentData[];
}

export function DepartmentChart({ data }: DepartmentChartProps) {
  const maxEmployees = Math.max(...data.map(d => d.total_employees), 1);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        Không có dữ liệu phòng ban
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 max-h-80 overflow-y-auto">
      {data.map((dept, index) => (
        <div key={dept.name} className="bg-white border rounded-lg p-3">
          <div className="flex items-start justify-between mb-3 gap-2">
            <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0">
              <span className="block truncate" title={dept.name}>
                {dept.name}
              </span>
            </h4>
            <div className="flex items-center space-x-2 text-xs text-gray-600 whitespace-nowrap">
              <span>{dept.present_today}/{dept.total_employees}</span>
              <span className={`font-medium px-1.5 py-0.5 rounded text-xs ${
                dept.attendance_rate >= 90 ? 'text-green-700 bg-green-50' :
                dept.attendance_rate >= 70 ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50'
              }`}>
                {dept.attendance_rate}%
              </span>
            </div>
          </div>
          
          {/* Employee count bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="truncate">Số lượng NV</span>
              <span className="whitespace-nowrap">{dept.total_employees}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(dept.total_employees / maxEmployees) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Attendance rate bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="truncate">Chấm công hôm nay</span>
              <span className="whitespace-nowrap">{dept.attendance_rate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dept.attendance_rate >= 90 ? 'bg-green-500' :
                  dept.attendance_rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(dept.attendance_rate, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}