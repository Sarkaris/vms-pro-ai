import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Lazy-loaded pages
const Visitors = lazy(() => import('./pages/Visitors'));
const CheckIn = lazy(() => import('./pages/CheckIn'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Admin = lazy(() => import('./pages/Admin'));
const Settings = lazy(() => import('./pages/Settings'));
const Emergency = lazy(() => import('./pages/Emergency')); // ✅ New page

// Protected Route Component (supports role restriction)
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
};

// Role-based home component
const RoleHome = () => {
  const { user } = useAuth();
  if (!user) return null;
  // All roles can access dashboard now (Security gets simplified version)
  return <Dashboard />;
};

// Main Layout Component
const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (!user) return null;

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onMobileMenuClick={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 p-3 sm:p-4 lg:p-6 pt-16 sm:pt-20 lg:pt-16 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="App bg-gray-50 dark:bg-gray-900 min-h-screen">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: { background: '#363636', color: '#fff' },
                  success: { duration: 3000, iconTheme: { primary: '#10B981', secondary: '#fff' } },
                  error: { duration: 5000, iconTheme: { primary: '#EF4444', secondary: '#fff' } },
                }}
              />

              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />

                {/* Protected */}
                <Route path="/" element={
                  <ProtectedRoute roles={['Super Admin','Admin','Security','Receptionist']}>
                    <MainLayout><RoleHome /></MainLayout>
                  </ProtectedRoute>
                } />

                <Route path="/visitors" element={
                  <ProtectedRoute roles={['Super Admin','Admin','Security','Receptionist']}>
                    <MainLayout><Suspense fallback={<LoadingSpinner />}><Visitors /></Suspense></MainLayout>
                  </ProtectedRoute>
                } />

                <Route path="/checkin" element={
                  <ProtectedRoute roles={['Super Admin','Admin','Security','Receptionist']}>
                    <MainLayout><Suspense fallback={<LoadingSpinner />}><CheckIn /></Suspense></MainLayout>
                  </ProtectedRoute>
                } />

                <Route path="/analytics" element={
                  <ProtectedRoute roles={['Super Admin','Admin']}>
                    <MainLayout><Suspense fallback={<LoadingSpinner />}><Analytics /></Suspense></MainLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute roles={['Super Admin','Admin']}>
                    <MainLayout><Suspense fallback={<LoadingSpinner />}><Admin /></Suspense></MainLayout>
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute>
                    <MainLayout><Suspense fallback={<LoadingSpinner />}><Settings /></Suspense></MainLayout>
                  </ProtectedRoute>
                } />

                {/* ✅ Emergency route added */}
                <Route path="/emergency" element={
                  <ProtectedRoute roles={['Super Admin','Admin','Security','Receptionist']}>
                    <MainLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Emergency />
                      </Suspense>
                    </MainLayout>
                  </ProtectedRoute>
                } />

              </Routes>
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
