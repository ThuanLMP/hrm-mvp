export interface TrainingCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingCourse {
  id: number;
  title: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  instructor?: string;
  durationHours?: number;
  maxParticipants?: number;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  courseType: 'in-person' | 'online' | 'hybrid';
  status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  cost?: number;
  imageUrl?: string;
  createdBy?: number;
  createdByName?: string;
  enrolledCount?: number;
  completedCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingEnrollment {
  id: number;
  courseId: number;
  courseTitle?: string;
  employeeId: number;
  employeeName?: string;
  employeeCode?: string;
  enrollmentDate: Date;
  completionDate?: Date;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'failed';
  completionPercentage: number;
  feedback?: string;
  rating?: number;
  certificateUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  categoryId?: number;
  instructor?: string;
  durationHours?: number;
  maxParticipants?: number;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  courseType: 'in-person' | 'online' | 'hybrid';
  cost?: number;
  imageUrl?: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  categoryId?: number;
  instructor?: string;
  durationHours?: number;
  maxParticipants?: number;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  courseType?: 'in-person' | 'online' | 'hybrid';
  status?: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  cost?: number;
  imageUrl?: string;
}

export interface EnrollEmployeeRequest {
  courseId: number;
  employeeId: number;
}

export interface UpdateEnrollmentRequest {
  status?: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'failed';
  completionPercentage?: number;
  feedback?: string;
  rating?: number;
  certificateUrl?: string;
}

export interface ListCoursesRequest {
  limit?: number;
  offset?: number;
  categoryId?: number;
  status?: string;
  courseType?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ListCoursesResponse {
  courses: TrainingCourse[];
  total: number;
}

export interface ListCategoriesResponse {
  categories: TrainingCategory[];
}

export interface ListEnrollmentsRequest {
  limit?: number;
  offset?: number;
  courseId?: number;
  employeeId?: number;
  status?: string;
}

export interface ListEnrollmentsResponse {
  enrollments: TrainingEnrollment[];
  total: number;
}

export interface TrainingStats {
  totalCourses: number;
  activeCourses: number;
  totalParticipants: number;
  completionRate: number;
  totalCost: number;
  averageRating: number;
  monthlyGrowth: number;
}