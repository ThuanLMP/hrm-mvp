import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, X } from "lucide-react";
import { useState } from "react";
import { useAuthenticatedBackend } from "../../hooks/useAuthenticatedBackend";

interface QuickCandidateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCandidateCreated: (candidateId: number) => void;
}

interface CandidateFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentPosition: string;
  experienceYears: string;
  source: string;
  coverLetterFile: File | null;
}

export function QuickCandidateForm({
  isOpen,
  onClose,
  onCandidateCreated,
}: QuickCandidateFormProps) {
  const authBackend = useAuthenticatedBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CandidateFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPosition: "",
    experienceYears: "0",
    source: "website",
    coverLetterFile: null,
  });

  const [errors, setErrors] = useState<Partial<CandidateFormData>>({});

  const createCandidateMutation = useMutation({
    mutationFn: (data: any) => authBackend.recruitment.createCandidate(data),
    onSuccess: (newCandidate) => {
      toast({
        title: "Thành công",
        description: "Đã tạo ứng viên thành công",
      });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      onCandidateCreated(newCandidate.id);
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo ứng viên",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      currentPosition: "",
      experienceYears: "0",
      source: "website",
      coverLetterFile: null,
    });
    setErrors({});
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CandidateFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Vui lòng nhập tên";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Vui lòng nhập họ";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!formData.currentPosition.trim()) {
      newErrors.currentPosition = "Vui lòng nhập vị trí hiện tại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      currentPosition: formData.currentPosition.trim(),
      experienceYears: parseInt(formData.experienceYears),
      source: formData.source,
      coverLetterFile: formData.coverLetterFile || undefined,
    };

    createCandidateMutation.mutate(submitData);
  };

  const handleInputChange = (field: keyof CandidateFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  console.log("QuickCandidateForm render - isOpen:", isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Thêm ứng viên mới</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Văn A"
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Họ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Nguyễn"
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="nguyenvana@example.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="0123456789"
            />
          </div>

          {/* Professional Fields */}
          <div className="space-y-2">
            <Label htmlFor="currentPosition">
              Vị trí hiện tại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="currentPosition"
              value={formData.currentPosition}
              onChange={(e) =>
                handleInputChange("currentPosition", e.target.value)
              }
              placeholder="Software Developer"
              className={errors.currentPosition ? "border-red-500" : ""}
            />
            {errors.currentPosition && (
              <p className="text-sm text-red-500">{errors.currentPosition}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Kinh nghiệm (năm)</Label>
              <Input
                id="experienceYears"
                type="number"
                value={formData.experienceYears}
                onChange={(e) =>
                  handleInputChange("experienceYears", e.target.value)
                }
                placeholder="3"
                min="0"
                max="50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Nguồn</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => handleInputChange("source", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="referral">Giới thiệu</SelectItem>
                  <SelectItem value="job-board">Job Board</SelectItem>
                  <SelectItem value="social-media">Mạng xã hội</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cover Letter File Upload */}
          <div className="space-y-2">
            <Label htmlFor="coverLetterFile">Thư xin việc</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="coverLetterFile"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData((prev) => ({ ...prev, coverLetterFile: file }));
                }}
                className="hidden"
              />
              <label htmlFor="coverLetterFile" className="cursor-pointer">
                {formData.coverLetterFile ? (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <FileText className="h-6 w-6" />
                    <span className="font-medium">
                      {formData.coverLetterFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({
                          ...prev,
                          coverLetterFile: null,
                        }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Tải lên thư xin việc
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, TXT (tối đa 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={createCandidateMutation.isPending}>
              {createCandidateMutation.isPending
                ? "Đang tạo..."
                : "Tạo ứng viên"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
