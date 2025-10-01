import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { BarChart3, Calendar, Check, Clock, Plus, User, X } from "lucide-react";
import { useState } from "react";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { useBackend } from "../hooks/useBackend";
import { formatDate } from "../utils/dateHelpers";

export function LeavePage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    leave_type: "annual",
    start_date: "",
    end_date: "",
    reason: "",
  });

  // Get current user's employee data
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: () => backend.employee.list({ limit: 100 }),
  });

  const currentEmployee = employees?.employees.find(
    (emp) => emp.user_id === user?.id
  );

  // Get leave balance for current employee
  const {
    data: leaveBalance,
    isLoading: balanceLoading,
    error: balanceError,
  } = useQuery({
    queryKey: ["leave-balance", currentEmployee?.id, new Date().getFullYear()],
    queryFn: async () => {
      console.log("Fetching leave balance for employee:", currentEmployee?.id);
      try {
        const result = await backend.leave.getBalance({
          employee_id: currentEmployee?.id!,
          year: new Date().getFullYear(),
        });
        console.log("Leave balance result:", result);
        return result;
      } catch (error) {
        console.error("Error fetching leave balance:", error);
        throw error;
      }
    },
    enabled: Boolean(currentEmployee?.id),
  });

  const canApprove =
    user?.role === "admin" || user?.role === "hr" || user?.role === "manager";
  const canViewAll =
    user?.role === "admin" || user?.role === "hr" || user?.role === "manager";

  // Get leave requests
  const { data: leaveRequests, isLoading } = useQuery({
    queryKey: [
      "leave-requests",
      statusFilter,
      employeeFilter,
      currentEmployee?.id,
    ],
    queryFn: () => {
      // For employees, force their own data only
      const employeeId = canViewAll
        ? employeeFilter && employeeFilter !== "all"
          ? parseInt(employeeFilter)
          : undefined
        : currentEmployee?.id;

      return backend.leave.list({
        status:
          statusFilter && statusFilter !== "all" ? statusFilter : undefined,
        employee_id: employeeId,
        limit: 100,
      });
    },
    enabled: Boolean(currentEmployee?.id || canViewAll),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => backend.leave.create(data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đơn xin nghỉ phép đã được tạo",
      });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      setIsCreateOpen(false);
      setFormData({
        leave_type: "annual",
        start_date: "",
        end_date: "",
        reason: "",
      });
    },
    onError: (error: any) => {
      console.error("Create leave request error:", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể tạo đơn xin nghỉ phép",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved_by }: { id: number; approved_by: number }) =>
      backend.leave.approve({ leave_request_id: id, approved_by }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã phê duyệt đơn xin nghỉ phép",
      });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
    },
    onError: (error: any) => {
      console.error("Approve leave request error:", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể phê duyệt đơn xin nghỉ phép",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({
      id,
      approved_by,
      rejection_reason,
    }: {
      id: number;
      approved_by: number;
      rejection_reason: string;
    }) =>
      backend.leave.reject({
        leave_request_id: id,
        approved_by,
        rejection_reason,
      }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã từ chối đơn xin nghỉ phép",
      });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      setIsRejectOpen(false);
      setSelectedRequest(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      console.error("Reject leave request error:", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể từ chối đơn xin nghỉ phép",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin nhân viên",
        variant: "destructive",
      });
      return;
    }

    // Validate required date fields
    if (!formData.start_date || formData.start_date.trim() === "") {
      toast({
        title: "Lỗi",
        description: "Ngày bắt đầu là bắt buộc",
        variant: "destructive",
      });
      return;
    }

    if (!formData.end_date || formData.end_date.trim() === "") {
      toast({
        title: "Lỗi",
        description: "Ngày kết thúc là bắt buộc",
        variant: "destructive",
      });
      return;
    }

    // Validate date logic
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (startDate > endDate) {
      toast({
        title: "Lỗi",
        description: "Ngày bắt đầu không thể sau ngày kết thúc",
        variant: "destructive",
      });
      return;
    }

    // Calculate number of days requested
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates

    // Check leave balance for annual and sick leave
    if (
      leaveBalance &&
      (formData.leave_type === "annual" || formData.leave_type === "sick")
    ) {
      let availableDays = 0;
      let leaveTypeName = "";

      if (formData.leave_type === "annual") {
        availableDays = leaveBalance.balance.annual_leave_remaining;
        leaveTypeName = "nghỉ phép năm";
      } else if (formData.leave_type === "sick") {
        availableDays = leaveBalance.balance.sick_leave_remaining;
        leaveTypeName = "nghỉ ốm";
      }

      if (daysDiff > availableDays) {
        toast({
          title: "Lỗi",
          description: `Không đủ ngày ${leaveTypeName}. Bạn còn ${availableDays} ngày nhưng yêu cầu ${daysDiff} ngày.`,
          variant: "destructive",
        });
        return;
      }
    }

    const submitData = {
      leave_type: formData.leave_type,
      start_date: startDate,
      end_date: endDate,
      reason:
        formData.reason && formData.reason.trim() !== ""
          ? formData.reason.trim()
          : undefined,
      employee_id: currentEmployee.id,
    };

    createMutation.mutate(submitData);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      cancelled: "outline",
    } as const;

    const labels = {
      pending: "Chờ duyệt",
      approved: "Đã duyệt",
      rejected: "Từ chối",
      cancelled: "Đã hủy",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getLeaveTypeLabel = (type: string) => {
    const labels = {
      annual: "Nghỉ phép năm",
      sick: "Nghỉ ốm",
      personal: "Nghỉ cá nhân",
      maternity: "Nghỉ thai sản",
      emergency: "Nghỉ khẩn cấp",
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {canViewAll ? "Quản lý nghỉ phép" : "Nghỉ phép của tôi"}
          </h1>
          <p className="text-gray-600">
            {canViewAll
              ? "Đơn xin nghỉ phép và phê duyệt"
              : "Đơn xin nghỉ phép và theo dõi trạng thái"}
          </p>
        </div>

        {currentEmployee && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo đơn nghỉ phép
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tạo đơn xin nghỉ phép</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="leave_type">Loại nghỉ phép</Label>
                  <Select
                    value={formData.leave_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, leave_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">
                        Nghỉ phép năm{" "}
                        {leaveBalance &&
                          `(còn ${leaveBalance.balance.annual_leave_remaining} ngày)`}
                      </SelectItem>
                      <SelectItem value="sick">
                        Nghỉ ốm{" "}
                        {leaveBalance &&
                          `(còn ${leaveBalance.balance.sick_leave_remaining} ngày)`}
                      </SelectItem>
                      <SelectItem value="personal">Nghỉ cá nhân</SelectItem>
                      <SelectItem value="maternity">Nghỉ thai sản</SelectItem>
                      <SelectItem value="emergency">Nghỉ khẩn cấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="start_date">Ngày bắt đầu</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">Ngày kết thúc</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                    min={
                      formData.start_date ||
                      new Date().toISOString().split("T")[0]
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Lý do</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Đang tạo..." : "Tạo đơn"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Leave Balance Card - Only show for employees */}
      {currentEmployee && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Số ngày nghỉ phép của tôi (năm {new Date().getFullYear()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
                <span className="ml-2">Đang tải thông tin nghỉ phép...</span>
              </div>
            ) : balanceError ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">
                  Lỗi khi tải thông tin nghỉ phép:{" "}
                  {(balanceError as any)?.message || "Unknown error"}
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Vui lòng thử lại sau hoặc liên hệ admin.
                </p>
              </div>
            ) : leaveBalance ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Annual Leave */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-blue-900">
                      Nghỉ phép năm
                    </h4>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Tổng cộng:</span>
                      <span className="font-medium text-blue-900">
                        {leaveBalance.balance.annual_leave_total} ngày
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Đã sử dụng:</span>
                      <span className="font-medium text-blue-900">
                        {leaveBalance.balance.annual_leave_used} ngày
                      </span>
                    </div>
                    <div className="border-t border-blue-200 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700 font-medium">
                          Còn lại:
                        </span>
                        <span
                          className={`font-bold ${
                            leaveBalance.balance.annual_leave_remaining > 5
                              ? "text-green-600"
                              : leaveBalance.balance.annual_leave_remaining > 2
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}
                        >
                          {leaveBalance.balance.annual_leave_remaining} ngày
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (leaveBalance.balance.annual_leave_used /
                              leaveBalance.balance.annual_leave_total) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Sick Leave */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-green-900">
                      Nghỉ ốm
                    </h4>
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Tổng cộng:</span>
                      <span className="font-medium text-green-900">
                        {leaveBalance.balance.sick_leave_total} ngày
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Đã sử dụng:</span>
                      <span className="font-medium text-green-900">
                        {leaveBalance.balance.sick_leave_used} ngày
                      </span>
                    </div>
                    <div className="border-t border-green-200 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700 font-medium">
                          Còn lại:
                        </span>
                        <span
                          className={`font-bold ${
                            leaveBalance.balance.sick_leave_remaining > 15
                              ? "text-green-600"
                              : leaveBalance.balance.sick_leave_remaining > 5
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}
                        >
                          {leaveBalance.balance.sick_leave_remaining} ngày
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (leaveBalance.balance.sick_leave_used /
                              leaveBalance.balance.sick_leave_total) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-600">Không có thông tin nghỉ phép</p>
              </div>
            )}

            {/* Warning messages */}
            {leaveBalance &&
              (leaveBalance.balance.annual_leave_remaining <= 2 ||
                leaveBalance.balance.sick_leave_remaining <= 5) && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start">
                    <Clock className="h-4 w-4 text-orange-600 mt-0.5 mr-2" />
                    <div className="text-sm text-orange-800">
                      <p className="font-medium mb-1">Lưu ý:</p>
                      <ul className="space-y-1">
                        {leaveBalance.balance.annual_leave_remaining <= 2 && (
                          <li>
                            • Số ngày nghỉ phép năm còn lại ít (
                            {leaveBalance.balance.annual_leave_remaining} ngày)
                          </li>
                        )}
                        {leaveBalance.balance.sick_leave_remaining <= 5 && (
                          <li>
                            • Số ngày nghỉ ốm còn lại ít (
                            {leaveBalance.balance.sick_leave_remaining} ngày)
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {canViewAll && (
              <div>
                <Label>Nhân viên</Label>
                <Select
                  value={employeeFilter}
                  onValueChange={setEmployeeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhân viên</SelectItem>
                    {employees?.employees.map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id.toString()}
                      >
                        {employee.full_name} ({employee.employee_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("all");
                  setEmployeeFilter("all");
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách đơn nghỉ phép ({leaveRequests?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nhân viên</th>
                    <th className="text-left py-3 px-4">Loại nghỉ</th>
                    <th className="text-left py-3 px-4">Thời gian</th>
                    <th className="text-left py-3 px-4">Số ngày</th>
                    <th className="text-left py-3 px-4">Lý do</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                    {canApprove && (
                      <th className="text-left py-3 px-4">Thao tác</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests?.leave_requests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {request.employee_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.employee_code}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {getLeaveTypeLabel(request.leave_type)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div>{formatDate(request.start_date)}</div>
                          <div className="text-gray-500">
                            đến {formatDate(request.end_date)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">
                          {request.total_days} ngày
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600 truncate">
                            {request.reason || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(request.status)}
                          {request.approver_name && (
                            <p className="text-xs text-gray-500">
                              Bởi: {request.approver_name}
                            </p>
                          )}
                          {request.rejection_reason && (
                            <p className="text-xs text-red-600">
                              {request.rejection_reason}
                            </p>
                          )}
                        </div>
                      </td>
                      {canApprove && (
                        <td className="py-3 px-4">
                          {request.status === "pending" && currentEmployee && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  approveMutation.mutate({
                                    id: request.id,
                                    approved_by: currentEmployee.id,
                                  })
                                }
                                disabled={approveMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedRequest(request.id);
                                  setIsRejectOpen(true);
                                }}
                                disabled={rejectMutation.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {leaveRequests?.leave_requests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Không có đơn nghỉ phép nào
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Từ chối đơn nghỉ phép</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection_reason">Lý do từ chối</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsRejectOpen(false);
                  setSelectedRequest(null);
                  setRejectionReason("");
                }}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    toast({
                      title: "Lỗi",
                      description: "Vui lòng nhập lý do từ chối",
                      variant: "destructive",
                    });
                    return;
                  }
                  if (selectedRequest && currentEmployee) {
                    rejectMutation.mutate({
                      id: selectedRequest,
                      approved_by: currentEmployee.id,
                      rejection_reason: rejectionReason,
                    });
                  }
                }}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
              >
                {rejectMutation.isPending ? "Đang xử lý..." : "Từ chối"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
