interface LeaveData {
  leave_type: string;
  count: number;
  percentage: number;
}

interface LeaveChartProps {
  data: LeaveData[];
}

const leaveTypeColors = {
  'annual': '#3B82F6',
  'sick': '#EF4444', 
  'personal': '#F59E0B',
  'maternity': '#EC4899',
  'emergency': '#8B5CF6'
};

const leaveTypeLabels = {
  'annual': 'Nghỉ phép năm',
  'sick': 'Nghỉ ốm',
  'personal': 'Nghỉ cá nhân',
  'maternity': 'Nghỉ thai sản',
  'emergency': 'Nghỉ khẩn cấp'
};

export function LeaveChart({ data }: LeaveChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        Không có dữ liệu nghỉ phép trong tháng này
      </div>
    );
  }

  let cumulativePercentage = 0;

  return (
    <div className="w-full">
      {/* Pie chart */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 42 42">
            <circle
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            {data.map((item, index) => {
              const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
              const strokeDashoffset = -cumulativePercentage;
              const color = leaveTypeColors[item.leave_type as keyof typeof leaveTypeColors] || '#6B7280';
              
              const segment = (
                <circle
                  key={item.leave_type}
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke={color}
                  strokeWidth="3"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:stroke-width-4"
                />
              );
              
              cumulativePercentage += item.percentage;
              return segment;
            })}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-600">Tổng đơn</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.leave_type} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ 
                  backgroundColor: leaveTypeColors[item.leave_type as keyof typeof leaveTypeColors] || '#6B7280'
                }}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {leaveTypeLabels[item.leave_type as keyof typeof leaveTypeLabels] || item.leave_type}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-900">{item.count}</span>
              <span className="text-xs text-gray-500">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}