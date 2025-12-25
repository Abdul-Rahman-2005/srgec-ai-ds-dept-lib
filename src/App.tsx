import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public Pages
import Index from "./pages/Index";
import About from "./pages/About";
import SearchBooks from "./pages/SearchBooks";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingApproval from "./pages/PendingApproval";
import RejectedAccount from "./pages/RejectedAccount";
import NotFound from "./pages/NotFound";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Registrations from "./pages/dashboard/Registrations";
import Books from "./pages/dashboard/Books";
import Borrows from "./pages/dashboard/Borrows";
import BorrowedBooks from "./pages/dashboard/BorrowedBooks";
import DashboardSearch from "./pages/dashboard/DashboardSearch";
import Magazines from "./pages/dashboard/Magazines";
import Journals from "./pages/dashboard/Journals";
import CSPProjects from "./pages/dashboard/CSPProjects";
import Reports from "./pages/dashboard/Reports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/search" element={<SearchBooks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/rejected" element={<RejectedAccount />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/search" element={
              <ProtectedRoute>
                <DashboardSearch />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/borrowed" element={
              <ProtectedRoute allowedRoles={['student', 'faculty']}>
                <BorrowedBooks />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/registrations" element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <Registrations />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/books" element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <Books />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/borrows" element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <Borrows />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/magazines" element={
              <ProtectedRoute>
                <Magazines />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/journals" element={
              <ProtectedRoute>
                <Journals />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/csp" element={
              <ProtectedRoute>
                <CSPProjects />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/reports" element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <Reports />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
