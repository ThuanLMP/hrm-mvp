import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

export function ShiftsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ca làm việc</h1>
        <p className="text-gray-600">Quản lý ca làm việc và lịch trình</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Tính năng đang phát triển
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Tính năng quản lý ca làm việc sẽ được triển khai trong phiên bản tiếp theo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}