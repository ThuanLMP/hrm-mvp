import React, { useState } from "react";
import backend from "~backend/client";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";

export const TestAuthStatus: React.FC = () => {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testLogin = async () => {
    setIsLoading(true);
    try {
      const response = await backend.auth.login({ email, password });
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${response.user.email}!`,
      });
    } catch (error: any) {
      toast({
        title: "Đăng nhập thất bại",
        description: error?.message || "Có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testTerminatedEmployee = async () => {
    setIsLoading(true);
    try {
      // Try to login with a terminated employee
      const response = await backend.auth.login({
        email: "terminated@example.com",
        password: "admin123",
      });
      toast({
        title: "Đăng nhập thành công",
        description: "Không nên xảy ra!",
        variant: "destructive",
      });
    } catch (error: any) {
      if (error?.message?.includes("vô hiệu hóa")) {
        toast({
          title: "Test thành công",
          description: "Nhân viên đã nghỉ việc không thể đăng nhập",
        });
      } else {
        toast({
          title: "Lỗi khác",
          description: error?.message || "Có lỗi xảy ra",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Test Employee Status Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email"
          />
        </div>

        <div>
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
          />
        </div>

        <div className="space-y-2">
          <Button onClick={testLogin} disabled={isLoading} className="w-full">
            {isLoading ? "Đang test..." : "Test Đăng Nhập Bình Thường"}
          </Button>

          <Button
            onClick={testTerminatedEmployee}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? "Đang test..." : "Test Nhân Viên Đã Nghỉ Việc"}
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          <p>
            <strong>Test 1:</strong> Đăng nhập với nhân viên active
          </p>
          <p>
            <strong>Test 2:</strong> Đăng nhập với nhân viên terminated
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
