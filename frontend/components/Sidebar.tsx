import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileUser,
  Building2,
  Clock, 
  Calendar, 
  Briefcase,
  Target,
  DollarSign,
  Shield,
  FileText,
  UserCheck,
  MessageSquare,
  GraduationCap,
  BarChart3,
  Settings,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const navigationSections: NavigationSection[] = [
  {
    title: '',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'director', 'hr', 'manager'] },
    ]
  },
  {
    title: 'QUẢN LÝ NHÂN VIÊN',
    items: [
      { name: 'Danh sách nhân viên', href: '/employees', icon: Users, roles: ['admin', 'hr', 'manager'] },
      { name: 'Phòng ban', href: '/departments', icon: Building2, roles: ['admin', 'hr', 'manager'] },
    ]
  },
  {
    title: 'CHẤM CÔNG',
    items: [
      { name: 'Timesheet', href: '/timesheet', icon: Clock, roles: ['admin', 'hr', 'manager', 'employee'] },
      { name: 'Nghỉ phép', href: '/leave', icon: Calendar, roles: ['admin', 'hr', 'manager', 'employee'] },
      { name: 'Ca làm việc', href: '/shifts', icon: Briefcase, roles: ['admin', 'hr', 'manager'] },
    ]
  },
  {
    title: 'LƯƠNG & PHÚC LỢI',
    items: [
      { name: 'Bảng lương', href: '/payroll', icon: DollarSign, roles: ['admin', 'hr'] },
      { name: 'Thưởng', href: '/bonus', icon: Target, roles: ['admin', 'hr'] },
      { name: 'Bảo hiểm', href: '/insurance', icon: Shield, roles: ['admin', 'hr'] },
    ]
  },
  {
    title: 'TUYỂN DỤNG',
    items: [
      { name: 'Đăng tin tuyển dụng', href: '/recruitment', icon: FileText, roles: ['admin', 'hr'] },
      { name: 'Ứng viên', href: '/candidates', icon: UserCheck, roles: ['admin', 'hr'] },
      { name: 'Phỏng vấn', href: '/interviews', icon: MessageSquare, roles: ['admin', 'hr'] },
      { name: 'Đào tạo & Phát triển', href: '/training', icon: GraduationCap, roles: ['admin', 'hr', 'manager'] },
      { name: 'Báo cáo & Thống kê', href: '/reports', icon: BarChart3, roles: ['admin', 'director', 'hr'] },
    ]
  },
  {
    title: 'CÀI ĐẶT',
    items: [
      { name: 'Cấu hình hệ thống', href: '/config', icon: Settings, roles: ['admin'] },
      { name: 'Quản lý khu vực', href: '/regions', icon: MapPin, roles: ['admin'] },
    ]
  }
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const getFilteredSections = () => {
    return navigationSections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        user && item.roles.includes(user.role)
      )
    })).filter(section => section.items.length > 0);
  };

  return (
    <div className="bg-white w-64 shadow-sm border-r border-gray-200 flex flex-col h-full">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Building2 className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">HR System</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        {getFilteredSections().map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {section.title && (
              <div className="px-6 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {section.title}
                </h3>
              </div>
            )}
            <div className="space-y-1 px-3">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href || 
                                (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn(
                      "mr-3 h-4 w-4 transition-colors",
                      isActive 
                        ? "text-blue-600" 
                        : "text-gray-400 group-hover:text-gray-600"
                    )} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
