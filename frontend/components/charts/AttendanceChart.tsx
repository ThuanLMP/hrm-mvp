import { useMemo } from 'react';

interface AttendanceData {
  date: string;
  total_employees: number;
  present_count: number;
  attendance_rate: number;
}

interface AttendanceChartProps {
  data: AttendanceData[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  const maxRate = Math.max(...data.map(d => d.attendance_rate), 100);
  const maxPresent = Math.max(...data.map(d => d.present_count), 1);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full h-64 p-4">
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((item, index) => (
          <div key={item.date} className="flex flex-col items-center flex-1">
            <div className="flex flex-col items-center mb-2 h-full justify-end">
              {/* Attendance rate bar */}
              <div 
                className="w-6 bg-blue-500 rounded-t-sm relative group"
                style={{ 
                  height: `${(item.attendance_rate / maxRate) * 100}%`,
                  minHeight: '4px'
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.attendance_rate}%
                </div>
              </div>
              
              {/* Present count bar */}
              <div 
                className="w-4 bg-green-400 rounded-t-sm mt-1 relative group"
                style={{ 
                  height: `${(item.present_count / maxPresent) * 60}%`,
                  minHeight: '2px'
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.present_count}/{item.total_employees}
                </div>
              </div>
            </div>
            
            {/* Date label */}
            <div className="text-xs text-gray-600 text-center mt-2 transform -rotate-45 origin-center">
              {formatDate(item.date)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center mt-4 space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-xs text-gray-600">Tỷ lệ chấm công (%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span className="text-xs text-gray-600">Số người có mặt</span>
        </div>
      </div>
    </div>
  );
}