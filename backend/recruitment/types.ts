export interface JobPosting {
  id: number;
  title: string;
  description: string;
  departmentId?: number;
  departmentName?: string;
  location?: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  requirements?: string;
  benefits?: string;
  skills?: string[];
  status: 'draft' | 'published' | 'paused' | 'closed' | 'filled';
  postedDate?: Date;
  deadline?: Date;
  createdBy?: number;
  createdByName?: string;
  applicationsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  educationLevel?: 'high-school' | 'bachelor' | 'master' | 'phd' | 'other';
  university?: string;
  major?: string;
  graduationYear?: number;
  experienceYears: number;
  currentPosition?: string;
  currentCompany?: string;
  skills?: string[];
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: 'new' | 'reviewing' | 'shortlisted' | 'interviewing' | 'hired' | 'rejected' | 'withdrawn';
  source: 'website' | 'linkedin' | 'referral' | 'job-board' | 'social-media' | 'other';
  applicationsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: number;
  candidateId: number;
  candidateName?: string;
  candidateEmail?: string;
  jobPostingId: number;
  jobTitle?: string;
  applicationDate: Date;
  status: 'applied' | 'reviewing' | 'shortlisted' | 'interviewing' | 'offered' | 'hired' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  resumeUrl?: string;
  notes?: string;
  rejectionReason?: string;
  interviewsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interview {
  id: number;
  applicationId: number;
  candidateName?: string;
  jobTitle?: string;
  interviewType: 'phone' | 'video' | 'in-person' | 'technical' | 'panel' | 'final';
  interviewDate: Date;
  durationMinutes: number;
  location?: string;
  meetingLink?: string;
  interviewerIds?: number[];
  interviewerNames?: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: string;
  rating?: number;
  result?: 'pass' | 'fail' | 'pending';
  nextSteps?: string;
  createdBy?: number;
  createdByName?: string;
  evaluationsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewEvaluation {
  id: number;
  interviewId: number;
  interviewerId: number;
  interviewerName?: string;
  technicalSkills?: number;
  communicationSkills?: number;
  problemSolving?: number;
  culturalFit?: number;
  overallRating?: number;
  strengths?: string;
  weaknesses?: string;
  feedback?: string;
  recommendation: 'hire' | 'no-hire' | 'maybe';
  createdAt: Date;
  updatedAt: Date;
}

// Request types
export interface CreateJobPostingRequest {
  title: string;
  description: string;
  departmentId?: number;
  location?: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  salaryMin?: number;
  salaryMax?: number;
  requirements?: string;
  benefits?: string;
  skills?: string[];
  deadline?: Date;
}

export interface UpdateJobPostingRequest {
  title?: string;
  description?: string;
  departmentId?: number;
  location?: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  salaryMin?: number;
  salaryMax?: number;
  requirements?: string;
  benefits?: string;
  skills?: string[];
  status?: 'draft' | 'published' | 'paused' | 'closed' | 'filled';
  deadline?: Date;
}

export interface CreateCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  educationLevel?: 'high-school' | 'bachelor' | 'master' | 'phd' | 'other';
  university?: string;
  major?: string;
  graduationYear?: number;
  experienceYears?: number;
  currentPosition?: string;
  currentCompany?: string;
  skills?: string[];
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  coverLetter?: string;
  source?: 'website' | 'linkedin' | 'referral' | 'job-board' | 'social-media' | 'other';
}

export interface CreateInterviewRequest {
  applicationId: number;
  interviewType: 'phone' | 'video' | 'in-person' | 'technical' | 'panel' | 'final';
  interviewDate: Date;
  durationMinutes?: number;
  location?: string;
  meetingLink?: string;
  interviewerIds?: number[];
  notes?: string;
}

export interface UpdateInterviewRequest {
  interviewType?: 'phone' | 'video' | 'in-person' | 'technical' | 'panel' | 'final';
  interviewDate?: Date;
  durationMinutes?: number;
  location?: string;
  meetingLink?: string;
  interviewerIds?: number[];
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: string;
  rating?: number;
  result?: 'pass' | 'fail' | 'pending';
  nextSteps?: string;
}

// Response types
export interface ListJobPostingsResponse {
  jobPostings: JobPosting[];
  total: number;
}

export interface ListCandidatesResponse {
  candidates: Candidate[];
  total: number;
}

export interface ListApplicationsResponse {
  applications: JobApplication[];
  total: number;
}

export interface ListInterviewsResponse {
  interviews: Interview[];
  total: number;
}

export interface RecruitmentStats {
  totalJobPostings: number;
  activeJobPostings: number;
  totalCandidates: number;
  totalApplications: number;
  interviewsScheduled: number;
  hiredCount: number;
  conversionRate: number;
  averageTimeToHire: number;
}