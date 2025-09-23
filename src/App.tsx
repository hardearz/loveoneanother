import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import TaskSubmit from "./pages/TaskSubmit";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Rewards from "./pages/Rewards";
import TaskManagement from "./pages/admin/TaskManagement";
import CreateTask from "./pages/admin/CreateTask";
import TaskApproval from "./pages/admin/TaskApproval";
import RedemptionManagement from "./pages/admin/RedemptionManagement";
import CreateRedemptionItem from "./pages/admin/CreateRedemptionItem";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? (
    <div className="relative">
      {children}
      <BottomNavigation />
    </div>
  ) : <Navigate to="/auth" replace />;
};

// Role-based Dashboard Route Component
const DashboardRoute = () => {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return profile?.role === 'admin' ? <AdminDashboard /> : <Dashboard />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/" replace /> : <>{children}</>;
};

const App = () => {
  console.log('App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<ProtectedRoute><DashboardRoute /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
              <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
              <Route path="/tasks/:id/submit" element={<ProtectedRoute><TaskSubmit /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
              <Route path="/admin/tasks" element={<ProtectedRoute><TaskManagement /></ProtectedRoute>} />
              <Route path="/admin/tasks/new" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
              <Route path="/admin/tasks/:id/approve" element={<ProtectedRoute><TaskApproval /></ProtectedRoute>} />
              <Route path="/admin/redemption" element={<ProtectedRoute><RedemptionManagement /></ProtectedRoute>} />
              <Route path="/admin/redemption/new" element={<ProtectedRoute><CreateRedemptionItem /></ProtectedRoute>} />
              <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
