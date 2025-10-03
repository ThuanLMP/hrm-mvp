import { ResponsiveButton } from "@/components/ui/ResponsiveButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  Download,
  Edit,
  Plus,
  Save,
  Search,
  Settings,
  Share,
  Trash2,
  Upload,
  User,
} from "lucide-react";

export function ResponsiveButtonDemo() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Responsive Button Demo</h1>
        <p className="text-gray-600">
          Các nút này sẽ hiển thị đầy đủ text trên màn hình lớn và chỉ hiển thị
          icon trên màn hình nhỏ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Nút cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <ResponsiveButton
                icon={Plus}
                text="Thêm mới"
                onClick={() => console.log("Add clicked")}
              />
              <ResponsiveButton
                icon={Edit}
                text="Chỉnh sửa"
                onClick={() => console.log("Edit clicked")}
                variant="outline"
              />
              <ResponsiveButton
                icon={Trash2}
                text="Xóa"
                onClick={() => console.log("Delete clicked")}
                variant="destructive"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Nút hành động</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <ResponsiveButton
                icon={Save}
                text="Lưu"
                onClick={() => console.log("Save clicked")}
                variant="default"
              />
              <ResponsiveButton
                icon={Search}
                text="Tìm kiếm"
                onClick={() => console.log("Search clicked")}
                variant="secondary"
              />
              <ResponsiveButton
                icon={Download}
                text="Tải xuống"
                onClick={() => console.log("Download clicked")}
                variant="outline"
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Nút điều hướng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <ResponsiveButton
                icon={User}
                text="Hồ sơ"
                onClick={() => console.log("Profile clicked")}
                variant="ghost"
              />
              <ResponsiveButton
                icon={Settings}
                text="Cài đặt"
                onClick={() => console.log("Settings clicked")}
                variant="ghost"
              />
              <ResponsiveButton
                icon={Bell}
                text="Thông báo"
                onClick={() => console.log("Notification clicked")}
                variant="ghost"
              />
            </div>
          </CardContent>
        </Card>

        {/* File Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Nút file</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <ResponsiveButton
                icon={Upload}
                text="Tải lên"
                onClick={() => console.log("Upload clicked")}
                variant="outline"
              />
              <ResponsiveButton
                icon={Download}
                text="Tải xuống"
                onClick={() => console.log("Download clicked")}
                variant="outline"
              />
              <ResponsiveButton
                icon={Share}
                text="Chia sẻ"
                onClick={() => console.log("Share clicked")}
                variant="outline"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Responsive Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Responsive</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Thay đổi kích thước cửa sổ để xem hiệu ứng responsive. Trên màn
              hình nhỏ (&lt; 640px), chỉ hiển thị icon. Trên màn hình lớn (≥
              640px), hiển thị cả icon và text.
            </p>
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
              <ResponsiveButton
                icon={Plus}
                text="Thêm nhân viên"
                onClick={() => console.log("Add employee clicked")}
              />
              <ResponsiveButton
                icon={Edit}
                text="Chỉnh sửa thông tin"
                onClick={() => console.log("Edit info clicked")}
                variant="outline"
              />
              <ResponsiveButton
                icon={Search}
                text="Tìm kiếm nhân viên"
                onClick={() => console.log("Search employee clicked")}
                variant="secondary"
              />
              <ResponsiveButton
                icon={Settings}
                text="Cài đặt hệ thống"
                onClick={() => console.log("System settings clicked")}
                variant="ghost"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
