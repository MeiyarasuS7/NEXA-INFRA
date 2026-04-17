import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Chatbot } from "@/components/Chatbot";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BrowseContractors from "./pages/BrowseContractors";
import ContractorProfile from "./pages/ContractorProfile";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminContractors from "./pages/admin/AdminContractors";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminProjectApprovals from "./pages/admin/AdminProjectApprovals";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminDisputes from "./pages/admin/AdminDisputes";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

import ContractorDashboard from "./pages/contractor/ContractorDashboard";
import ContractorProjects from "./pages/contractor/ContractorProjects";
import ContractorProfilePage from "./pages/contractor/ContractorProfile";
import ContractorReviews from "./pages/contractor/ContractorReviews";
import ContractorChat from "./pages/contractor/ContractorChat";

import UserDashboard from "./pages/user/UserDashboard";
import UserProjects from "./pages/user/UserProjects";
import UserRequestContractor from "./pages/user/UserRequestContractor";
import UserChat from "./pages/user/UserChat";
import UserProfile from "./pages/user/UserProfile";
import UserFindContractors from "./pages/user/UserFindContractors";

const queryClient = new QueryClient();

const DashboardRedirect = () => {
  const { role } = useAuth();
  if (role === 'super_admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'contractor') return <Navigate to="/contractor/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/browse-contractors" element={<BrowseContractors />} />
            <Route path="/contractor/:id" element={<ContractorProfile />} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

            {/* Dashboard redirect */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="approvals" element={<AdminProjectApprovals />} />
              <Route path="contractors" element={<AdminContractors />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="disputes" element={<AdminDisputes />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Contractor */}
            <Route path="/contractor" element={<ProtectedRoute allowedRoles={['contractor']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<ContractorDashboard />} />
              <Route path="projects" element={<ContractorProjects />} />
              <Route path="profile" element={<ContractorProfilePage />} />
              <Route path="reviews" element={<ContractorReviews />} />
              <Route path="chat" element={<ContractorChat />} />
            </Route>

            {/* User */}
            <Route path="/user" element={<ProtectedRoute allowedRoles={['user']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="find-contractors" element={<UserFindContractors />} />
              <Route path="projects" element={<UserProjects />} />
              <Route path="request-contractor" element={<UserRequestContractor />} />
              <Route path="chat" element={<UserChat />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Chatbot />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
