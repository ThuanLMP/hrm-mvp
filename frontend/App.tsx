import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { TimesheetPage } from './pages/TimesheetPage';
import { LeavePage } from './pages/LeavePage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { ConfigPage } from './pages/ConfigPage';
import { ProfilePage } from './pages/ProfilePage';
import { ShiftsPage } from './pages/ShiftsPage';
import { PayrollPage } from './pages/PayrollPage';
import { BonusPage } from './pages/BonusPage';
import { InsurancePage } from './pages/InsurancePage';
import { RecruitmentPage } from './pages/RecruitmentPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { InterviewsPage } from './pages/InterviewsPage';
import { TrainingPage } from './pages/TrainingPage';
import { ReportsPage } from './pages/ReportsPage';
import RegionsPage from './pages/RegionsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleBasedRedirect } from './components/RoleBasedRedirect';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<RoleBasedRedirect />} />
                        <Route path="/dashboard" element={
                          <RoleProtectedRoute allowedRoles={['admin', 'director', 'hr', 'manager']}>
                            <DashboardPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/employees/*" element={
                          <RoleProtectedRoute allowedRoles={['admin', 'hr', 'manager']}>
                            <EmployeesPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/timesheet" element={<TimesheetPage />} />
                        <Route path="/leave" element={<LeavePage />} />
                        <Route path="/departments" element={
                          <RoleProtectedRoute allowedRoles={['admin', 'hr', 'manager']}>
                            <DepartmentsPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/config" element={
                          <RoleProtectedRoute allowedRoles={['admin']}>
                            <ConfigPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/shifts" element={
                          <RoleProtectedRoute allowedRoles={['admin', 'hr', 'manager']}>
                            <ShiftsPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/payroll" element={
                          <RoleProtectedRoute allowedRoles={['admin', 'hr']}>
                            <PayrollPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/bonus" element={
                          <RoleProtectedRoute allowedRoles={['admin', 'hr']}>
                            <BonusPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/bonus" element={
                          <RoleProtectedRoute allowedRoles={['admin', 'hr']}>
                            <BonusPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/insurance" element={
                          <RoleProtectedRoute allowedRoles={['admin', 'hr']}>
                            <InsurancePage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/recruitment" element={
                          <RoleProtectedRoute allowedRoles={['admin', 'hr']}>
                            <RecruitmentPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/candidates" element={
                          <RoleProtectedRoute allowedRoles={['admin', 'hr']}>
                            <CandidatesPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/interviews" element={
                          <RoleProtectedRoute allowedRoles={['admin', 'hr']}>
                            <InterviewsPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/training" element={
                          <RoleProtectedRoute allowedRoles={['admin', 'hr', 'manager']}>
                            <TrainingPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/reports" element={
                          <RoleProtectedRoute allowedRoles={['admin', 'director', 'hr']}>
                            <ReportsPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/regions" element={
                          <RoleProtectedRoute allowedRoles={['admin']}>
                            <RegionsPage />
                          </RoleProtectedRoute>
                        } />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
