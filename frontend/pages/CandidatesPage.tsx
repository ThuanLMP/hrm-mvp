import { useState } from 'react';
import { Plus, Search, Filter, User, Mail, Phone, MapPin, Briefcase, Calendar, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import backend from '~backend/client';
import type { Candidate } from '~backend/recruitment/types';
import { useAuth } from '../contexts/AuthContext';

export function CandidatesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  
  const { toast } = useToast();
  const { user } = useAuth();

  const canManageCandidates = user?.role === 'admin' || user?.role === 'hr';

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', search, statusFilter, sourceFilter],
    queryFn: () => backend.recruitment.listCandidates({
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      source: sourceFilter !== 'all' ? sourceFilter : undefined,
      limit: 100,
    }),
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'secondary',
      reviewing: 'default',
      shortlisted: 'default',
      interviewing: 'default',
      hired: 'default',
      rejected: 'destructive',
      withdrawn: 'secondary',
    } as const;
    
    const labels = {
      new: 'Mới',
      reviewing: 'Đang xem xét',
      shortlisted: 'Vào vòng trong',
      interviewing: 'Phỏng vấn',
      hired: 'Đã tuyển',
      rejected: 'Từ chối',
      withdrawn: 'Rút lui',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const labels = {
      website: 'Website',
      linkedin: 'LinkedIn',
      referral: 'Giới thiệu',
      'job-board': 'Trang tuyển dụng',
      'social-media': 'Mạng xã hội',
      other: 'Khác',
    };

    return (
      <Badge variant="outline">
        {labels[source as keyof typeof labels] || source}
      </Badge>
    );
  };

  const getEducationLevel = (level?: string) => {
    if (!level) return '';
    
    const labels = {
      'high-school': 'THPT',
      'bachelor': 'Cử nhân',
      'master': 'Thạc sĩ',
      'phd': 'Tiến sĩ',
      'other': 'Khác',
    };

    return labels[level as keyof typeof labels] || level;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ứng viên</h1>
          <p className="text-muted-foreground">Quản lý hồ sơ ứng viên và ứng tuyển</p>
        </div>
        {canManageCandidates && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm ứng viên
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm ứng viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="new">Mới</SelectItem>
                <SelectItem value="reviewing">Đang xem xét</SelectItem>
                <SelectItem value="shortlisted">Vào vòng trong</SelectItem>
                <SelectItem value="interviewing">Phỏng vấn</SelectItem>
                <SelectItem value="hired">Đã tuyển</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
                <SelectItem value="withdrawn">Rút lui</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nguồn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nguồn</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="referral">Giới thiệu</SelectItem>
                <SelectItem value="job-board">Trang tuyển dụng</SelectItem>
                <SelectItem value="social-media">Mạng xã hội</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setSourceFilter('all');
              }}
            >
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {candidates?.candidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{candidate.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.currentPosition}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    {getStatusBadge(candidate.status)}
                    {getSourceBadge(candidate.source)}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {candidate.email && (
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{candidate.email}</span>
                    </div>
                  )}
                  
                  {candidate.phone && (
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  
                  {candidate.address && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{candidate.address}</span>
                    </div>
                  )}
                  
                  {candidate.currentCompany && (
                    <div className="flex items-center text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span className="truncate">{candidate.currentCompany}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Kinh nghiệm:</span>
                    <span className="font-medium">{candidate.experienceYears} năm</span>
                  </div>
                  
                  {candidate.educationLevel && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Học vấn:</span>
                      <span className="font-medium">{getEducationLevel(candidate.educationLevel)}</span>
                    </div>
                  )}
                  
                  {candidate.university && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Trường:</span>
                      <span className="font-medium truncate">{candidate.university}</span>
                    </div>
                  )}
                </div>

                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Kỹ năng:</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{candidate.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-muted-foreground">
                    {candidate.applicationsCount || 0} đơn ứng tuyển
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canManageCandidates && (
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {candidates?.candidates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có ứng viên nào</h3>
            <p className="text-muted-foreground text-center mb-4">
              Ứng viên sẽ xuất hiện ở đây khi họ ứng tuyển vào các vị trí
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}