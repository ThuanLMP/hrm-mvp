import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveButton } from "@/components/ui/ResponsiveButton";
import { Bell, LogOut, User } from "lucide-react";
import { useState } from "react";

export function HeaderDemo() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleProfileClick = () => {
    setSelectedAction("Hồ sơ cá nhân");
    console.log("Navigate to profile");
  };

  const handleLogoutClick = () => {
    setSelectedAction("Đăng xuất");
    console.log("Logout");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Demo Header Dropdown</h1>
        <p className="text-gray-600">
          Test dropdown menu với "Hồ sơ cá nhân" và "Đăng xuất"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Header Style */}
        <Card>
          <CardHeader>
            <CardTitle>Header gốc (Fixed)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white shadow-sm border border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6">
              <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                <span className="hidden sm:inline">
                  Hệ thống quản lý nhân sự
                </span>
                <span className="sm:hidden">HRM</span>
              </h1>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <ResponsiveButton
                  icon={Bell}
                  text="Thông báo"
                  onClick={() => console.log("Notification clicked")}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline text-sm font-medium">
                        admin@example.com
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleProfileClick}>
                      <User className="mr-2 h-4 w-4" />
                      Hồ sơ cá nhân
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogoutClick}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ResponsiveButton Version */}
        <Card>
          <CardHeader>
            <CardTitle>Với ResponsiveButton</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white shadow-sm border border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6">
              <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                <span className="hidden sm:inline">
                  Hệ thống quản lý nhân sự
                </span>
                <span className="sm:hidden">HRM</span>
              </h1>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <ResponsiveButton
                  icon={Bell}
                  text="Thông báo"
                  onClick={() => console.log("Notification clicked")}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ResponsiveButton
                      icon={User}
                      text="admin@example.com"
                      onClick={() => {
                        // This will be handled by the dropdown
                      }}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleProfileClick}>
                      <User className="mr-2 h-4 w-4" />
                      Hồ sơ cá nhân
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogoutClick}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dropdown Menu Items Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Test các menu items riêng lẻ:
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Hồ sơ cá nhân</span>
              </button>
              <button
                onClick={handleLogoutClick}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Action Display */}
      {selectedAction && (
        <Card>
          <CardHeader>
            <CardTitle>Action được chọn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {selectedAction === "Hồ sơ cá nhân" ? (
                  <User className="h-5 w-5 text-blue-600" />
                ) : (
                  <LogOut className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg">{selectedAction}</h3>
                <p className="text-gray-600">
                  {selectedAction === "Hồ sơ cá nhân"
                    ? "Sẽ chuyển đến trang profile"
                    : "Sẽ đăng xuất khỏi hệ thống"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSS Classes Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>CSS Classes được sử dụng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Dropdown Trigger Button:</h4>
              <div className="bg-gray-100 p-4 rounded-lg">
                <code className="text-sm">
                  {`flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors`}
                </code>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Layout:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      flex items-center
                    </code>{" "}
                    - Flexbox center
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">space-x-2</code>{" "}
                    - Khoảng cách ngang
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">px-3 py-2</code>{" "}
                    - Padding
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Hover Effects:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      hover:text-gray-900
                    </code>{" "}
                    - Màu chữ khi hover
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      hover:bg-gray-100
                    </code>{" "}
                    - Màu nền khi hover
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      transition-colors
                    </code>{" "}
                    - Chuyển đổi màu mượt
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
