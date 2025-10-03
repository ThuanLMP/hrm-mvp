import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Calendar, Clock, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useBackend } from "../hooks/useBackend";

export function ConfigPage() {
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configs, isLoading } = useQuery({
    queryKey: ["system-config"],
    queryFn: () => backend.config.get(),
  });

  const [formData, setFormData] = useState<Record<string, string>>({});

  // Initialize form data when configs are loaded
  useEffect(() => {
    if (configs?.configs) {
      const initialData: Record<string, string> = {};
      configs.configs.forEach((config) => {
        initialData[config.config_key] = config.config_value;
      });
      setFormData(initialData);
    }
  }, [configs]);

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      // Update all configs
      const promises = Object.entries(data).map(([key, value]) =>
        backend.config.update({ config_key: key, config_value: value })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Cấu hình hệ thống đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["system-config"] });
    },
    onError: (error: any) => {
      console.error("Update config error:", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật cấu hình",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const configSections = [
    {
      title: "Thông tin công ty",
      icon: Building2,
      configs:
        configs?.configs.filter((c) => c.config_key === "company_name") || [],
    },
    {
      title: "Thời gian làm việc",
      icon: Clock,
      configs:
        configs?.configs.filter((c) =>
          ["work_hours_per_day", "work_start_time", "work_end_time"].includes(
            c.config_key
          )
        ) || [],
    },
    {
      title: "Chính sách nghỉ phép",
      icon: Calendar,
      configs:
        configs?.configs.filter((c) =>
          ["annual_leave_days", "sick_leave_days"].includes(c.config_key)
        ) || [],
    },
    {
      title: "Cấu hình nhân viên",
      icon: Settings,
      configs:
        configs?.configs.filter((c) =>
          ["education_levels"].includes(c.config_key)
        ) || [],
    },
  ];

  const getConfigLabel = (key: string) => {
    const labels: Record<string, string> = {
      company_name: "Tên công ty",
      work_hours_per_day: "Số giờ làm việc / ngày",
      work_start_time: "Giờ bắt đầu làm việc",
      work_end_time: "Giờ kết thúc làm việc",
      annual_leave_days: "Số ngày phép năm",
      sick_leave_days: "Số ngày nghỉ ốm / năm",
      education_levels: "Trình độ học vấn (phân cách bằng dấu phẩy)",
    };
    return labels[key] || key;
  };

  const getInputType = (key: string) => {
    if (key.includes("time")) return "time";
    if (key.includes("days") || key.includes("hours")) return "number";
    return "text";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-gray-600">Cấu hình các thông số hệ thống</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {configSections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <section.icon className="h-5 w-5 mr-2" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.configs.map((config) => (
                  <div key={config.config_key}>
                    <Label htmlFor={config.config_key}>
                      {getConfigLabel(config.config_key)}
                    </Label>
                    <Input
                      id={config.config_key}
                      type={getInputType(config.config_key)}
                      value={formData[config.config_key] || ""}
                      onChange={(e) =>
                        handleInputChange(config.config_key, e.target.value)
                      }
                      className="mt-1"
                    />
                    {config.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {config.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="min-w-[120px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? "Đang lưu..." : "Lưu cài đặt"}
          </Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Thông tin hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Phiên bản hệ thống:</span>
              <span className="ml-2 font-medium">1.0.0</span>
            </div>
            <div>
              <span className="text-gray-500">Cập nhật lần cuối:</span>
              <span className="ml-2 font-medium">
                {new Date().toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Múi giờ:</span>
              <span className="ml-2 font-medium">UTC+7 (Việt Nam)</span>
            </div>
            <div>
              <span className="text-gray-500">Ngôn ngữ:</span>
              <span className="ml-2 font-medium">Tiếng Việt</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
