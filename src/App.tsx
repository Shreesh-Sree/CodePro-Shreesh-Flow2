import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import Login from "@/pages/Login";
import Unauthorized from "@/pages/shared/Unauthorized";
import Dashboard from "@/pages/shared/Dashboard";
import Colleges from "@/pages/management/Colleges";
import Departments from "@/pages/management/Departments";
import Users from "@/pages/management/Users";
import BlogsManagement from "@/pages/management/BlogsManagement";
import Students from "@/pages/management/Students";
import StudentDetail from "@/pages/management/StudentDetail";
import Placements from "@/pages/management/Placements";
import Analytics from "@/pages/management/Analytics";
import Progress from "@/pages/shared/Progress";
import Roles from "@/pages/management/Roles";
import Schedule from "@/pages/management/Schedule";
import Tests from "@/pages/shared/Tests";
import TestAttempt from "@/pages/shared/TestAttempt";
import TestsManagement from "@/pages/management/TestsManagement";
import AddQuestions from "@/pages/management/AddQuestions";
import Results from "@/pages/shared/Results";
import TestResult from "@/pages/shared/TestResult";
import MyTestResult from "@/pages/shared/MyTestResult";
import MyResults from "@/pages/shared/MyResults";

import Notifications from "@/pages/shared/Notifications";
import FAQ from "@/pages/shared/FAQ";
import NotFound from "@/pages/shared/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <AuthProvider>
            <PermissionProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected routes with layout */}
                <Route element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                } />
                <Route path="/departments" element={
                  <ProtectedRoute permissions={['department:read', 'department:read_own']}>
                    <Departments />
                  </ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute permissions={['user:read', 'user:create', 'user:update', 'user:delete', 'mentor:read', 'mentor:create', 'mentor:update', 'mentor:delete']}>
                    <Users />
                  </ProtectedRoute>
                } />
                <Route path="/students" element={
                  <ProtectedRoute permissions={['student:read', 'student:create', 'student:update', 'student:delete', 'student:bulk_create']}>
                    <Students />
                  </ProtectedRoute>
                } />
                <Route path="/student/:id" element={
                  <ProtectedRoute permissions={['student:read', 'student:create', 'student:update', 'student:delete', 'student:bulk_create']}>
                    <StudentDetail />
                  </ProtectedRoute>
                } />
                <Route path="/placements" element={
                  <ProtectedRoute permissions={['placement:read', 'placement:create', 'placement:update', 'placement:delete']}>
                    <Placements />
                  </ProtectedRoute>
                } />
                <Route path="/roles" element={
                  <ProtectedRoute role="SUPERADMIN">
                    <Roles />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute permission="analytics:read">
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/progress" element={
                  <ProtectedRoute permission="progress:read">
                    <Progress />
                  </ProtectedRoute>
                } />
                <Route path="/schedule" element={
                  <ProtectedRoute permissions={['test:create', 'test:schedule']}>
                    <Schedule />
                  </ProtectedRoute>
                } />
                <Route path="/schedule/edit/:testId" element={
                  <ProtectedRoute permissions={['test:create', 'test:schedule']}>
                    <Schedule />
                  </ProtectedRoute>
                } />
                <Route path="/tests-management" element={
                  <ProtectedRoute permissions={['result:read', 'test:view_results']}>
                    <TestsManagement />
                  </ProtectedRoute>
                } />
                {/* Blog Management Route */}
                <Route path="/management/blogs" element={
                  <ProtectedRoute roles={['ADMIN', 'SUPERADMIN']}>
                    <BlogsManagement />
                  </ProtectedRoute>
                } />
                <Route path="/tests" element={<Tests />} />
                <Route path="/tests/:testId/attempt" element={<TestAttempt />} />
                <Route path="/tests/:testId/my-result" element={<MyTestResult />} />
                <Route path="/my-results" element={<MyResults />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/questions" element={
                  <ProtectedRoute permission="question:create">
                    <AddQuestions />
                  </ProtectedRoute>
                } />
                <Route path="/results" element={
                  <ProtectedRoute permissions={['result:read', 'test:view_results']}>
                    <Results />
                  </ProtectedRoute>
                } />
                <Route path="/results/:testId" element={
                  <ProtectedRoute permissions={['result:read', 'test:view_results']}>
                    <Results />
                  </ProtectedRoute>
                } />
                {/* Per-student result (staff) - must be after /results/:testId */}
                <Route path="/results/:testId/student/:userId" element={
                  <ProtectedRoute permissions={['result:read', 'test:view_results']}>
                    <TestResult />
                  </ProtectedRoute>
                } />
                } />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PermissionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider >
);

export default App;
