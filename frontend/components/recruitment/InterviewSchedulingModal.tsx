import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Calendar, Clock, MapPin, Phone, Users, Video, X } from "lucide-react";
import { useState } from "react";
import { useAuthenticatedBackend } from "../../hooks/useAuthenticatedBackend";

interface InterviewSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  candidateId: string;
  jobTitle: string;
  interviewType: string;
  interviewDate: string;
  interviewTime: string;
  durationMinutes: string;
  location: string;
  meetingLink: string;
  interviewerIds: string[];
  notes: string;
}

export function InterviewSchedulingModal({
  isOpen,
  onClose,
}: InterviewSchedulingModalProps) {
  const authBackend = useAuthenticatedBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    candidateId: "",
    jobTitle: "",
    interviewType: "",
    interviewDate: "",
    interviewTime: "",
    durationMinutes: "60",
    location: "",
    meetingLink: "",
    interviewerIds: [],
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Fetch candidates for dropdown
  const { data: candidates } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => authBackend.recruitment.listCandidates({ limit: 100 }),
    enabled: isOpen,
  });

  // Fetch employees for interviewer selection
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: () => (authBackend as any).employee.list({ limit: 100 }),
    enabled: isOpen,
  });

  const createInterviewMutation = useMutation({
    mutationFn: (data: any) => authBackend.recruitment.createInterview(data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã lên lịch phỏng vấn thành công",
      });
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lên lịch phỏng vấn",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setFormData({
      candidateId: "",
      jobTitle: "",
      interviewType: "",
      interviewDate: "",
      interviewTime: "",
      durationMinutes: "60",
      location: "",
      meetingLink: "",
      interviewerIds: [],
      notes: "",
    });
    setErrors({});
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.candidateId) {
      newErrors.candidateId = "Vui lòng chọn ứng viên";
    }
    if (!formData.jobTitle) {
      newErrors.jobTitle = "Vui lòng nhập vị trí ứng tuyển";
    }
    if (!formData.interviewType) {
      newErrors.interviewType = "Vui lòng chọn loại phỏng vấn";
    }
    if (!formData.interviewDate) {
      newErrors.interviewDate = "Vui lòng chọn ngày phỏng vấn";
    }
    if (!formData.interviewTime) {
      newErrors.interviewTime = "Vui lòng chọn giờ phỏng vấn";
    }
    if (!formData.durationMinutes) {
      newErrors.durationMinutes = "Vui lòng nhập thời lượng";
    }

    // Validate date is not in the past
    if (formData.interviewDate && formData.interviewTime) {
      const interviewDateTime = new Date(
        `${formData.interviewDate}T${formData.interviewTime}`
      );
      if (interviewDateTime <= new Date()) {
        newErrors.interviewDate = "Ngày phỏng vấn phải trong tương lai";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Try to find an existing application first
      let applicationId = null;

      try {
        const applications = await (
          authBackend as any
        ).recruitment.listApplications({
          limit: 1000,
        });

        console.log("Applications found:", applications);

        // Try to find any application for this candidate
        const application = applications.applications?.find(
          (app: any) => app.candidateId === parseInt(formData.candidateId)
        );

        if (application) {
          applicationId = application.id;
          console.log("Found existing application:", application);
        } else {
          // If no application found, try to find any application
          if (
            applications.applications &&
            applications.applications.length > 0
          ) {
            applicationId = applications.applications[0].id;
            console.log(
              "Using first available application:",
              applications.applications[0]
            );
          }
        }
      } catch (appError) {
        console.log("Could not fetch applications:", appError);
      }

      // If still no application found, show error
      if (!applicationId) {
        toast({
          title: "Lỗi",
          description:
            "Không tìm thấy đơn ứng tuyển nào. Vui lòng tạo đơn ứng tuyển trước khi lên lịch phỏng vấn.",
          variant: "destructive",
        });
        return;
      }

      const interviewDateTime = new Date(
        `${formData.interviewDate}T${formData.interviewTime}`
      );

      const submitData = {
        applicationId: applicationId,
        interviewType: formData.interviewType as any,
        interviewDate: interviewDateTime,
        durationMinutes: parseInt(formData.durationMinutes),
        location: formData.location || undefined,
        meetingLink: formData.meetingLink || undefined,
        interviewerIds:
          formData.interviewerIds.length > 0
            ? formData.interviewerIds.map((id) => parseInt(id))
            : undefined,
        notes: formData.notes || undefined,
      };

      console.log("Submitting interview data:", submitData);
      createInterviewMutation.mutate(submitData);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo lịch phỏng vấn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInterviewerToggle = (employeeId: string) => {
    setFormData((prev) => ({
      ...prev,
      interviewerIds: prev.interviewerIds.includes(employeeId)
        ? prev.interviewerIds.filter((id) => id !== employeeId)
        : [...prev.interviewerIds, employeeId],
    }));
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "in-person":
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getInterviewTypeLabel = (type: string) => {
    const labels = {
      phone: "Điện thoại",
      video: "Video call",
      "in-person": "Trực tiếp",
      technical: "Kỹ thuật",
      panel: "Hội đồng",
      final: "Cuối cùng",
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="min-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Lên lịch phỏng vấn
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Summary Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              Tóm tắt cuộc phỏng vấn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Ứng viên:</span>
                <span className="ml-2 font-medium">
                  {formData.candidateId
                    ? (candidates as any)?.candidates?.find(
                        (candidate: any) =>
                          candidate.id.toString() === formData.candidateId
                      )?.fullName || "Chưa chọn"
                    : "Chưa chọn"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Vị trí ứng tuyển:</span>
                <span className="ml-2 font-medium">
                  {formData.jobTitle || "Chưa nhập"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Loại phỏng vấn:</span>
                <span className="ml-2 font-medium">
                  {formData.interviewType
                    ? getInterviewTypeLabel(formData.interviewType)
                    : "Chưa chọn"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Ngày giờ:</span>
                <span className="ml-2 font-medium">
                  {formData.interviewDate && formData.interviewTime
                    ? `${new Date(
                        `${formData.interviewDate}T${formData.interviewTime}`
                      ).toLocaleString("vi-VN")}`
                    : "Chưa chọn"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Người phỏng vấn:</span>
                <span className="ml-2 font-medium">
                  {formData.interviewerIds.length > 0
                    ? `${formData.interviewerIds.length} người`
                    : "Chưa chọn"}
                </span>
              </div>
            </div>
          </div>
          {/* Candidate Selection */}
          <div className="space-y-2">
            <Label htmlFor="candidateId">
              Ứng viên <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.candidateId}
              onValueChange={(value) => handleInputChange("candidateId", value)}
            >
              <SelectTrigger
                className={errors.candidateId ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Chọn ứng viên" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {(candidates as any)?.candidates?.map((candidate: any) => (
                  <SelectItem
                    key={candidate.id}
                    value={candidate.id.toString()}
                  >
                    {candidate.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.candidateId && (
              <p className="text-sm text-red-500">{errors.candidateId}</p>
            )}
          </div>

          {/* Job Title Input */}
          <div className="space-y-2">
            <Label htmlFor="jobTitle">
              Vị trí ứng tuyển <span className="text-red-500">*</span>
            </Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              placeholder="Nhập vị trí ứng tuyển..."
              className={errors.jobTitle ? "border-red-500" : ""}
            />
            {errors.jobTitle && (
              <p className="text-sm text-red-500">{errors.jobTitle}</p>
            )}
          </div>

          {/* Interview Type and Date/Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interviewType">
                Loại phỏng vấn <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.interviewType}
                onValueChange={(value) =>
                  handleInputChange("interviewType", value)
                }
              >
                <SelectTrigger
                  className={errors.interviewType ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Chọn loại phỏng vấn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Điện thoại
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video call
                    </div>
                  </SelectItem>
                  <SelectItem value="in-person">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Trực tiếp
                    </div>
                  </SelectItem>
                  <SelectItem value="technical">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Kỹ thuật
                    </div>
                  </SelectItem>
                  <SelectItem value="panel">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Hội đồng
                    </div>
                  </SelectItem>
                  <SelectItem value="final">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Cuối cùng
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.interviewType && (
                <p className="text-sm text-red-500">{errors.interviewType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMinutes">
                Thời lượng (phút) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="durationMinutes"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) =>
                  handleInputChange("durationMinutes", e.target.value)
                }
                placeholder="60"
                min="15"
                max="480"
                className={errors.durationMinutes ? "border-red-500" : ""}
              />
              {errors.durationMinutes && (
                <p className="text-sm text-red-500">{errors.durationMinutes}</p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interviewDate">
                Ngày phỏng vấn <span className="text-red-500">*</span>
              </Label>
              <Input
                id="interviewDate"
                type="date"
                value={formData.interviewDate}
                onChange={(e) =>
                  handleInputChange("interviewDate", e.target.value)
                }
                min={new Date().toISOString().split("T")[0]}
                className={errors.interviewDate ? "border-red-500" : ""}
              />
              {errors.interviewDate && (
                <p className="text-sm text-red-500">{errors.interviewDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewTime">
                Giờ phỏng vấn <span className="text-red-500">*</span>
              </Label>
              <Input
                id="interviewTime"
                type="time"
                value={formData.interviewTime}
                onChange={(e) =>
                  handleInputChange("interviewTime", e.target.value)
                }
                className={errors.interviewTime ? "border-red-500" : ""}
              />
              {errors.interviewTime && (
                <p className="text-sm text-red-500">{errors.interviewTime}</p>
              )}
            </div>
          </div>

          {/* Location and Meeting Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="h-4 w-4 inline mr-1" />
                Địa điểm
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Phòng họp A, Tầng 5..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingLink">
                <Video className="h-4 w-4 inline mr-1" />
                Link cuộc họp
              </Label>
              <Input
                id="meetingLink"
                value={formData.meetingLink}
                onChange={(e) =>
                  handleInputChange("meetingLink", e.target.value)
                }
                placeholder="https://meet.google.com/..."
              />
            </div>
          </div>

          {/* Interviewers Selection */}
          <div className="space-y-2">
            <Label>
              <Users className="h-4 w-4 inline mr-1" />
              Người phỏng vấn
            </Label>
            <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
              {(employees as any)?.employees?.map((employee: any) => (
                <label
                  key={employee.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.interviewerIds.includes(
                      employee.id.toString()
                    )}
                    onChange={() =>
                      handleInterviewerToggle(employee.id.toString())
                    }
                    className="rounded mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">
                        {employee.full_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {employee.employee_code}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {employee.position}
                    </div>
                    {employee.department_name && (
                      <div className="text-xs text-gray-500 mt-1">
                        {employee.department_name}
                      </div>
                    )}
                    {employee.email && (
                      <div className="text-xs text-gray-400 mt-1">
                        {employee.email}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
            {formData.interviewerIds.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Đã chọn ({formData.interviewerIds.length} người):
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.interviewerIds.map((id) => {
                    const employee = (employees as any)?.employees?.find(
                      (emp: any) => emp.id.toString() === id
                    );
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        <Users className="h-3 w-3" />
                        {employee?.full_name}
                        <button
                          type="button"
                          onClick={() => handleInterviewerToggle(id)}
                          className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Ghi chú về cuộc phỏng vấn..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={createInterviewMutation.isPending}>
              {createInterviewMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Đang lên lịch...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Lên lịch phỏng vấn
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
