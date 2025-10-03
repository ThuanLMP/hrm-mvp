import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  Filter,
  MapPin,
  Phone,
  Plus,
  Search,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import backend from "~backend/client";
import { InterviewSchedulingModal } from "../components/recruitment/InterviewSchedulingModal";
import { useAuth } from "../contexts/AuthContext";

export function InterviewsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const canManageInterviews =
    user?.role === "admin" || user?.role === "hr" || user?.role === "manager";

  // Get date range for filtering
  const getDateRange = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    switch (dateFilter) {
      case "today":
        return {
          startDate: today.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      case "tomorrow":
        return {
          startDate: tomorrow.toISOString().split("T")[0],
          endDate: tomorrow.toISOString().split("T")[0],
        };
      case "this-week":
        return {
          startDate: today.toISOString().split("T")[0],
          endDate: nextWeek.toISOString().split("T")[0],
        };
      default:
        return {};
    }
  };

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["interviews", search, statusFilter, typeFilter, dateFilter],
    queryFn: () => {
      const dateRange = getDateRange();
      return backend.recruitment.listInterviews({
        status: statusFilter !== "all" ? statusFilter : undefined,
        interviewType: typeFilter !== "all" ? typeFilter : undefined,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: 100,
      });
    },
  });

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: "default",
      "in-progress": "default",
      completed: "default",
      cancelled: "destructive",
      rescheduled: "secondary",
    } as const;

    const labels = {
      scheduled: "Đã lên lịch",
      "in-progress": "Đang diễn ra",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      rescheduled: "Dời lịch",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      phone: "outline",
      video: "outline",
      "in-person": "outline",
      technical: "outline",
      panel: "outline",
      final: "outline",
    } as const;

    const labels = {
      phone: "Điện thoại",
      video: "Video call",
      "in-person": "Trực tiếp",
      technical: "Kỹ thuật",
      panel: "Hội đồng",
      final: "Cuối cùng",
    };

    const icons = {
      phone: <Phone className="h-3 w-3" />,
      video: <Video className="h-3 w-3" />,
      "in-person": <Users className="h-3 w-3" />,
      technical: <Users className="h-3 w-3" />,
      panel: <Users className="h-3 w-3" />,
      final: <Users className="h-3 w-3" />,
    };

    return (
      <Badge
        variant={variants[type as keyof typeof variants] || "outline"}
        className="flex items-center gap-1"
      >
        {icons[type as keyof typeof icons]}
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getResultBadge = (result?: string) => {
    if (!result || result === "pending") return null;

    const variants = {
      pass: "default",
      fail: "destructive",
    } as const;

    const labels = {
      pass: "Đạt",
      fail: "Không đạt",
    };

    return (
      <Badge variant={variants[result as keyof typeof variants] || "secondary"}>
        {labels[result as keyof typeof labels] || result}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Phỏng vấn</h1>
          <p className="text-muted-foreground">
            Quản lý lịch phỏng vấn và đánh giá ứng viên
          </p>
        </div>
        {canManageInterviews && (
          <Button onClick={() => setIsSchedulingModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Lên lịch phỏng vấn
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Tìm kiếm và lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="tomorrow">Ngày mai</SelectItem>
                <SelectItem value="this-week">Tuần này</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                <SelectItem value="in-progress">Đang diễn ra</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="rescheduled">Dời lịch</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Loại phỏng vấn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="phone">Điện thoại</SelectItem>
                <SelectItem value="video">Video call</SelectItem>
                <SelectItem value="in-person">Trực tiếp</SelectItem>
                <SelectItem value="technical">Kỹ thuật</SelectItem>
                <SelectItem value="panel">Hội đồng</SelectItem>
                <SelectItem value="final">Cuối cùng</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setTypeFilter("all");
                setDateFilter("all");
              }}
            >
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interviews List */}
      <div className="space-y-4">
        {(interviews as any)?.interviews?.map((interview: any) => (
          <Card
            key={interview.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {interview.candidateName}
                      </h3>
                      <p className="text-muted-foreground">
                        {interview.jobTitle}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2 items-end">
                      {getStatusBadge(interview.status)}
                      {getTypeBadge(interview.interviewType)}
                      {getResultBadge(interview.result)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(interview.interviewDate)}</span>
                    </div>

                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        {formatTime(interview.interviewDate)} (
                        {interview.durationMinutes}p)
                      </span>
                    </div>

                    {interview.location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">{interview.location}</span>
                      </div>
                    )}

                    {interview.interviewerNames &&
                      interview.interviewerNames.length > 0 && (
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 mr-2" />
                          <span className="truncate">
                            {interview.interviewerNames.length === 1
                              ? interview.interviewerNames[0]
                              : `${interview.interviewerNames[0]} +${
                                  interview.interviewerNames.length - 1
                                }`}
                          </span>
                        </div>
                      )}
                  </div>

                  {interview.notes && (
                    <div className="text-sm">
                      <span className="font-medium">Ghi chú: </span>
                      <span className="text-muted-foreground">
                        {interview.notes}
                      </span>
                    </div>
                  )}

                  {interview.feedback && (
                    <div className="text-sm">
                      <span className="font-medium">Phản hồi: </span>
                      <span className="text-muted-foreground">
                        {interview.feedback}
                      </span>
                    </div>
                  )}

                  {interview.rating && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium mr-2">Đánh giá:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={
                              star <= interview.rating!
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="ml-2 text-muted-foreground">
                        ({interview.rating}/5)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-muted-foreground">
                      {interview.evaluationsCount || 0} đánh giá từ phỏng vấn
                      viên
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canManageInterviews && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(interviews as any)?.interviews?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Chưa có cuộc phỏng vấn nào
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Lên lịch phỏng vấn cho ứng viên tiềm năng
            </p>
            {canManageInterviews && (
              <Button onClick={() => setIsSchedulingModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Lên lịch phỏng vấn
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Interview Scheduling Modal */}
      <InterviewSchedulingModal
        isOpen={isSchedulingModalOpen}
        onClose={() => setIsSchedulingModalOpen(false)}
      />
    </div>
  );
}
