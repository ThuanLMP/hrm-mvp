import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export interface OvertimeStats {
  department: string;
  total_overtime_hours: number;
  employee_count: number;
  avg_overtime_per_employee: number;
}

interface OvertimeChartProps {
  data: OvertimeStats[];
}

export function OvertimeChart({ data }: OvertimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        Không có dữ liệu tăng ca
      </div>
    );
  }

  const maxHours = Math.max(...data.map(d => d.total_overtime_hours));
  const maxAvg = Math.max(...data.map(d => d.avg_overtime_per_employee));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="department" 
            stroke="#666"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            label={{ value: 'Giờ tăng ca', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'total_overtime_hours' ? `${value} giờ` : `${value.toFixed(1)} giờ/người`,
              name === 'total_overtime_hours' ? 'Tổng giờ tăng ca' : 'TB tăng ca/người'
            ]}
            labelFormatter={(label) => `Phòng ban: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <Legend />
          <Bar 
            dataKey="total_overtime_hours" 
            name="Tổng giờ tăng ca"
            fill="#3b82f6" 
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="avg_overtime_per_employee" 
            name="TB tăng ca/người"
            fill="#10b981" 
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}