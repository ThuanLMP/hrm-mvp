import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
        <p className="text-gray-600">Báo cáo tổng hợp và phân tích dữ liệu nhân sự</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Tính năng đang phát triển
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Tính năng báo cáo & thống kê sẽ được triển khai trong phiên bản tiếp theo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}