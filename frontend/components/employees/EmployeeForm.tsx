import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Key, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DEGREE_CLASSIFICATIONS,
  EDUCATION_LEVELS,
  TRAINING_SYSTEMS,
} from "../../constants/education";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthenticatedBackend } from "../../hooks/useAuthenticatedBackend";
import { useBackend } from "../../hooks/useBackend";
import { LoadingSpinner } from "../ui/LoadingSpinner";

export function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backend = useBackend();
  const authBackend = useAuthenticatedBackend();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "employee",
    employee_code: "",
    full_name: "",
    phone: "",
    address: "",
    date_of_birth: "",
    hire_date: "",
    termination_date: "",
    position: "",
    department_id: "",
    region_id: "",
    salary: "",
    status: "active",
    photo_url: "",
    education_level: "",
    school_name: "",
    major: "",
    graduation_year: "",
    training_system: "",
    degree_classification: "",
    annual_leave_days: "",
    sick_leave_days: "",
  });
  const [passwordReset, setPasswordReset] = useState({
    newPassword: "",
    confirmPassword: "",
    showPasswordSection: false,
  });

  const { data: employee, isLoading: employeeLoading } = useQuery<any>({
    queryKey: ["employee", id],
    queryFn: () => backend.employee.get({ id: parseInt(id!) }),
    enabled: isEdit,
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => backend.department.list(),
  });

  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: () => backend.region.list(),
  });

  const { data: configs } = useQuery({
    queryKey: ["system-config"],
    queryFn: () => backend.config.get(),
  });

  // Disable body scroll when form is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (employee) {
      setFormData({
        email: "",
        password: "",
        role: "employee",
        employee_code: employee.employee_code,
        full_name: employee.full_name,
        phone: employee.phone || "",
        address: employee.address || "",
        date_of_birth: employee.date_of_birth
          ? new Date(employee.date_of_birth).toISOString().split("T")[0]
          : "",
        hire_date: new Date(employee.hire_date).toISOString().split("T")[0],
        termination_date: (employee as any).termination_date
          ? new Date((employee as any).termination_date)
              .toISOString()
              .split("T")[0]
          : "",
        position: employee.position || "",
        department_id: employee.department_id?.toString() || "",
        region_id: employee.region_id?.toString() || "",
        salary: employee.salary?.toString() || "",
        status: employee.status,
        photo_url: employee.photo_url || "",
        education_level: employee.education_level || "",
        school_name: employee.school_name || "",
        major: employee.major || "",
        graduation_year: employee.graduation_year?.toString() || "",
        training_system: employee.training_system || "",
        degree_classification: employee.degree_classification || "",
        annual_leave_days: employee.annual_leave_days?.toString() || "",
        sick_leave_days: employee.sick_leave_days?.toString() || "",
      });
      console.log(formData);
    }
  }, [employee]);

  const createMutation = useMutation({
    mutationFn: (data: any) => backend.employee.create(data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Nhân viên đã được tạo thành công",
      });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      navigate("/employees");
    },
    onError: (error: any) => {
      console.error("Create employee error:", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể tạo nhân viên",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      backend.employee.update({ id: parseInt(id!), ...data }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Thông tin nhân viên đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
      navigate("/employees");
    },
    onError: (error: any) => {
      console.error("Update employee error:", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật nhân viên",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { user_id: number; new_password: string }) =>
      authBackend.auth.resetPassword(data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Mật khẩu đã được reset thành công",
      });
      setPasswordReset({
        newPassword: "",
        confirmPassword: "",
        showPasswordSection: false,
      });
    },
    onError: (error: any) => {
      console.error("Reset password error:", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể reset mật khẩu",
        variant: "destructive",
      });
    },
  });

  if (isEdit && employeeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.hire_date || formData.hire_date.trim() === "") {
      toast({
        title: "Lỗi",
        description: "Ngày vào làm là bắt buộc",
        variant: "destructive",
      });
      return;
    }

    const submitData: any = {
      employee_code: formData.employee_code.trim(),
      full_name: formData.full_name.trim(),
      role: formData.role,
      status: formData.status,
      department_id:
        formData.department_id && formData.department_id !== "none"
          ? parseInt(formData.department_id)
          : undefined,
      region_id:
        formData.region_id && formData.region_id !== "none"
          ? parseInt(formData.region_id)
          : undefined,
      salary:
        formData.salary && formData.salary.trim() !== ""
          ? parseFloat(formData.salary)
          : undefined,
      date_of_birth:
        formData.date_of_birth && formData.date_of_birth.trim() !== ""
          ? new Date(formData.date_of_birth)
          : undefined,
      hire_date: new Date(formData.hire_date.trim()),
      phone:
        formData.phone && formData.phone.trim() !== ""
          ? formData.phone.trim()
          : undefined,
      address:
        formData.address && formData.address.trim() !== ""
          ? formData.address.trim()
          : undefined,
      position:
        formData.position && formData.position.trim() !== ""
          ? formData.position.trim()
          : undefined,
      photo_url:
        formData.photo_url && formData.photo_url.trim() !== ""
          ? formData.photo_url.trim()
          : undefined,
      education_level:
        formData.education_level && formData.education_level.trim() !== ""
          ? formData.education_level.trim()
          : undefined,
      school_name:
        formData.school_name && formData.school_name.trim() !== ""
          ? formData.school_name.trim()
          : undefined,
      major:
        formData.major && formData.major.trim() !== ""
          ? formData.major.trim()
          : undefined,
      graduation_year:
        formData.graduation_year && formData.graduation_year.trim() !== ""
          ? parseInt(formData.graduation_year)
          : undefined,
      training_system:
        formData.training_system && formData.training_system.trim() !== ""
          ? formData.training_system.trim()
          : undefined,
      degree_classification:
        formData.degree_classification &&
        formData.degree_classification.trim() !== ""
          ? formData.degree_classification.trim()
          : undefined,
      annual_leave_days:
        formData.annual_leave_days && formData.annual_leave_days.trim() !== ""
          ? parseInt(formData.annual_leave_days)
          : undefined,
      sick_leave_days:
        formData.sick_leave_days && formData.sick_leave_days.trim() !== ""
          ? parseInt(formData.sick_leave_days)
          : undefined,
      email:
        formData.email && formData.email.trim() !== ""
          ? formData.email.trim()
          : undefined,
      password:
        formData.password && formData.password.trim() !== ""
          ? formData.password.trim()
          : undefined,
    };

    if (formData.termination_date && formData.termination_date.trim() !== "") {
      submitData.termination_date = new Date(formData.termination_date);
    }

    if (isEdit) {
      const { email, password, role, employee_code, hire_date, ...updateData } =
        submitData;

      const finalUpdateData = {
        ...updateData,
        termination_date: submitData.termination_date || null,
        education_level: submitData.education_level,
        school_name: submitData.school_name,
        major: submitData.major,
        graduation_year: submitData.graduation_year,
        training_system: submitData.training_system,
        degree_classification: submitData.degree_classification,
        annual_leave_days: submitData.annual_leave_days,
        sick_leave_days: submitData.sick_leave_days,
      };

      updateMutation.mutate(finalUpdateData);
    } else {
      const createData = {
        ...submitData,
        status: submitData.status || "active",
      };

      if (submitData.termination_date) {
        createData.termination_date = submitData.termination_date;
      }

      createMutation.mutate(createData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (!passwordReset.newPassword || passwordReset.newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới phải có ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }

    if (passwordReset.newPassword !== passwordReset.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive",
      });
      return;
    }

    if (!employee?.user_id) {
      toast({
        title: "Lỗi",
        description: "Nhân viên này chưa có tài khoản người dùng",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate({
      user_id: employee.user_id,
      new_password: passwordReset.newPassword,
    });
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate("/employees")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="employee_code">Mã nhân viên *</Label>
                <Input
                  id="employee_code"
                  value={formData.employee_code}
                  onChange={(e) =>
                    handleInputChange("employee_code", e.target.value)
                  }
                  required
                  disabled={isEdit}
                />
              </div>

              <div>
                <Label htmlFor="full_name">Họ và tên *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    handleInputChange("full_name", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="photo_url">Ảnh nhân viên</Label>
                <Input
                  id="photo_url"
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) =>
                    handleInputChange("photo_url", e.target.value)
                  }
                  placeholder="URL ảnh nhân viên"
                />
                {formData.photo_url && (
                  <div className="mt-2">
                    <img
                      src={formData.photo_url}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="date_of_birth">Ngày sinh</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    handleInputChange("date_of_birth", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Education Level, Training System, Degree Classification - Same Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="education_level">Trình độ học vấn</Label>
                  <Select
                    value={formData.education_level}
                    onValueChange={(value) =>
                      handleInputChange("education_level", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trình độ học vấn">
                        {formData.education_level &&
                        formData.education_level !== "none"
                          ? EDUCATION_LEVELS[
                              formData.education_level as keyof typeof EDUCATION_LEVELS
                            ]
                          : formData.education_level === "none"
                          ? "Không có"
                          : "Chọn trình độ học vấn"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có</SelectItem>
                      {Object.entries(EDUCATION_LEVELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="training_system">Hệ đào tạo</Label>
                  <Select
                    value={formData.training_system}
                    onValueChange={(value) =>
                      handleInputChange("training_system", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hệ đào tạo">
                        {formData.training_system &&
                        formData.training_system !== "none"
                          ? TRAINING_SYSTEMS[
                              formData.training_system as keyof typeof TRAINING_SYSTEMS
                            ]
                          : formData.training_system === "none"
                          ? "Không có"
                          : "Chọn hệ đào tạo"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có</SelectItem>
                      {Object.entries(TRAINING_SYSTEMS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="degree_classification">
                    Xếp loại bằng cấp
                  </Label>
                  <Select
                    value={formData.degree_classification}
                    onValueChange={(value) =>
                      handleInputChange("degree_classification", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn xếp loại">
                        {formData.degree_classification &&
                        formData.degree_classification !== "none"
                          ? DEGREE_CLASSIFICATIONS[
                              formData.degree_classification as keyof typeof DEGREE_CLASSIFICATIONS
                            ]
                          : formData.degree_classification === "none"
                          ? "Không có"
                          : "Chọn xếp loại"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có</SelectItem>
                      {Object.entries(DEGREE_CLASSIFICATIONS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* School Details - Separate Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school_name">Tên trường</Label>
                  <Input
                    id="school_name"
                    value={formData.school_name}
                    onChange={(e) =>
                      handleInputChange("school_name", e.target.value)
                    }
                    placeholder="Tên trường đại học/cao đẳng"
                  />
                </div>

                <div>
                  <Label htmlFor="major">Chuyên ngành</Label>
                  <Input
                    id="major"
                    value={formData.major}
                    onChange={(e) => handleInputChange("major", e.target.value)}
                    placeholder="Tên chuyên ngành"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="graduation_year">Năm tốt nghiệp</Label>
                <Input
                  id="graduation_year"
                  type="number"
                  value={formData.graduation_year}
                  onChange={(e) =>
                    handleInputChange("graduation_year", e.target.value)
                  }
                  placeholder="Năm tốt nghiệp"
                  min="1950"
                  max={new Date().getFullYear() + 5}
                  className="max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin công việc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hire_date">Ngày vào làm *</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) =>
                    handleInputChange("hire_date", e.target.value)
                  }
                  required
                  disabled={isEdit}
                />
              </div>

              <div>
                <Label htmlFor="termination_date">Ngày nghỉ việc</Label>
                <Input
                  id="termination_date"
                  type="date"
                  value={formData.termination_date}
                  onChange={(e) =>
                    handleInputChange("termination_date", e.target.value)
                  }
                  placeholder="Để trống nếu chưa nghỉ việc"
                />
              </div>

              <div>
                <Label htmlFor="position">Chức vụ</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    handleInputChange("position", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="department_id">Phòng ban</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) =>
                    handleInputChange("department_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban">
                      {formData.department_id &&
                      formData.department_id !== "none"
                        ? departments?.departments.find(
                            (dept) =>
                              dept.id.toString() === formData.department_id
                          )?.name || "Chọn phòng ban"
                        : formData.department_id === "none"
                        ? "Không có"
                        : "Chọn phòng ban"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có</SelectItem>
                    {departments?.departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="region_id">Khu vực</Label>
                <Select
                  value={formData.region_id}
                  onValueChange={(value) =>
                    handleInputChange("region_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực">
                      {formData.region_id && formData.region_id !== "none"
                        ? regions?.regions.find(
                            (region) =>
                              region.id.toString() === formData.region_id
                          )?.name || "Chọn khu vực"
                        : formData.region_id === "none"
                        ? "Không có"
                        : "Chọn khu vực"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có</SelectItem>
                    {regions?.regions.map((region) => (
                      <SelectItem key={region.id} value={region.id.toString()}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="salary">Lương (VND)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange("salary", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="annual_leave_days">
                    Ngày nghỉ phép năm (ngày)
                  </Label>
                  <Input
                    id="annual_leave_days"
                    type="number"
                    value={formData.annual_leave_days}
                    onChange={(e) =>
                      handleInputChange("annual_leave_days", e.target.value)
                    }
                    placeholder="Để trống để dùng mặc định hệ thống"
                    min="0"
                    max="365"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Để trống để sử dụng cài đặt mặc định của hệ thống
                  </p>
                </div>

                <div>
                  <Label htmlFor="sick_leave_days">Ngày nghỉ ốm (ngày)</Label>
                  <Input
                    id="sick_leave_days"
                    type="number"
                    value={formData.sick_leave_days}
                    onChange={(e) =>
                      handleInputChange("sick_leave_days", e.target.value)
                    }
                    placeholder="Để trống để dùng mặc định hệ thống"
                    min="0"
                    max="365"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Để trống để sử dụng cài đặt mặc định của hệ thống
                  </p>
                </div>
              </div>

              {isEdit && (
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang làm việc</SelectItem>
                      <SelectItem value="inactive">Tạm nghỉ</SelectItem>
                      <SelectItem value="terminated">Đã nghỉ việc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {!isEdit && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Thông tin tài khoản (Tùy chọn)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Để trống nếu không tạo tài khoản"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Để trống nếu không tạo tài khoản"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Vai trò</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        handleInputChange("role", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Nhân viên</SelectItem>
                        <SelectItem value="manager">Quản lý</SelectItem>
                        <SelectItem value="hr">Nhân sự</SelectItem>
                        <SelectItem value="admin">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Password Reset Section - Only for Admin and Edit Mode */}
        {isEdit && isAdmin && employee?.user_id && (
          <Card className="lg:col-span-2 mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Quản lý mật khẩu
                </CardTitle>
                {!passwordReset.showPasswordSection && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPasswordReset((prev) => ({
                        ...prev,
                        showPasswordSection: true,
                      }))
                    }
                  >
                    Reset mật khẩu
                  </Button>
                )}
              </div>
            </CardHeader>
            {passwordReset.showPasswordSection && (
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword">Mật khẩu mới *</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordReset.newPassword}
                        onChange={(e) =>
                          setPasswordReset((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        Xác nhận mật khẩu *
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordReset.confirmPassword}
                        onChange={(e) =>
                          setPasswordReset((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="Nhập lại mật khẩu mới"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPasswordReset({
                          newPassword: "",
                          confirmPassword: "",
                          showPasswordSection: false,
                        })
                      }
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending
                        ? "Đang reset..."
                        : "Reset mật khẩu"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>
        )}

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/employees")}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending
              ? "Đang lưu..."
              : "Lưu"}
          </Button>
        </div>
      </form>
    </div>
  );
}
