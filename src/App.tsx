
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import CustomerList from '@/pages/CustomerList';
import CustomerForm from '@/pages/CustomerForm';
import DigitalCard from '@/pages/DigitalCard';
import VerifyAccess from '@/pages/VerifyAccess';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import ArchitecturePage from '@/pages/ArchitecturePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const { isLoading, isAuthenticated } = useAuth();

  console.log('App rendering - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/auth" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />
          } 
        />
        <Route path="/verify" element={<VerifyAccess />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/customers" element={
          <ProtectedRoute>
            <CustomerList />
          </ProtectedRoute>
        } />
        
        <Route path="/customers/new" element={
          <ProtectedRoute>
            <CustomerForm />
          </ProtectedRoute>
        } />
        
        <Route path="/customers/edit/:id" element={
          <ProtectedRoute>
            <CustomerForm />
          </ProtectedRoute>
        } />
        
        <Route path="/customers/card/:id" element={
          <ProtectedRoute>
            <DigitalCard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="App">
          <AppContent />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;