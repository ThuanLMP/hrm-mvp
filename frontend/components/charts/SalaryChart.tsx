interface SalaryData {
  department: string;
  average_salary: number;
  min_salary: number;
  max_salary: number;
  employee_count: number;
}

interface SalaryChartProps {
  data: SalaryData[];
}

export function SalaryChart({ data }: SalaryChartProps) {
  const maxSalary = Math.max(...data.map(d => d.max_salary), 1);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M VNĐ';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K VNĐ';
    }
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        Không có dữ liệu lương
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 max-h-80 overflow-y-auto">
      {data.map((dept) => (
        <div key={dept.department} className="bg-white border rounded-lg p-3">
          <div className="flex items-start justify-between mb-3 gap-2">
            <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0">
              <span className="block truncate" title={dept.department}>
                {dept.department}
              </span>
            </h4>
            <span className="text-xs text-gray-600 whitespace-nowrap ml-2">
              {dept.employee_count} NV
            </span>
          </div>
          
          <div className="space-y-3">
            {/* Average salary */}
            <div>
              <div className="flex justify-between text-xs mb-1 gap-2">
                <span className="text-gray-600 truncate">TB</span>
                <span className="font-medium text-blue-600 text-xs whitespace-nowrap">
                  {formatCurrency(dept.average_salary)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((dept.average_salary / maxSalary) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Salary range */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="text-left">
                <span className="block truncate" title={formatCurrency(dept.min_salary)}>
                  Min: {formatCurrency(dept.min_salary)}
                </span>
              </div>
              <div className="text-right">
                <span className="block truncate" title={formatCurrency(dept.max_salary)}>
                  Max: {formatCurrency(dept.max_salary)}
                </span>
              </div>
            </div>
            
            {/* Salary range bar */}
            <div className="relative w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-red-400 to-green-500 h-1.5 rounded-full"
                style={{ 
                  width: `${Math.min((dept.max_salary / maxSalary) * 100, 100)}%`,
                  marginLeft: `${Math.min((dept.min_salary / maxSalary) * 100, 80)}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}