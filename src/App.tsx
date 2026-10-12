import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';

// Lazy-loaded pages for bundle splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ExpensesPage = lazy(() => import('./pages/expenses/ExpensesPage').then(m => ({ default: m.ExpensesPage })));
const AddEditExpensePage = lazy(() => import('./pages/expenses/AddEditExpensePage').then(m => ({ default: m.AddEditExpensePage })));
const BudgetsPage = lazy(() => import('./pages/budgets/BudgetsPage').then(m => ({ default: m.BudgetsPage })));
const CategoriesPage = lazy(() => import('./pages/categories/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AboutPage = lazy(() => import('./pages/about/AboutPage').then(m => ({ default: m.AboutPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

import { Wallet } from 'lucide-react';

const PageFallback: React.FC = () => (
  <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 bg-page text-ink-muted">
    <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    <span className="text-xs font-medium tracking-wide">Loading workspace...</span>
  </div>
);

const SessionLoader: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-page text-ink">
    <div className="w-10 h-10 rounded-xl bg-accent text-accent-contrast flex items-center justify-center shadow-subtle mb-3 animate-pulse">
      <Wallet className="w-5 h-5" />
    </div>
    <div className="flex items-center gap-2 text-xs text-ink-secondary">
      <div className="w-3.5 h-3.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      <span>Restoring secure session...</span>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SessionLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SessionLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1816',
                  color: '#f9f8f6',
                  fontSize: '13px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                success: {
                  iconTheme: {
                    primary: '#0d5f47',
                    secondary: '#f9f8f6',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#c53030',
                    secondary: '#f9f8f6',
                  },
                },
              }}
            />

            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicOnlyRoute>
                      <RegisterPage />
                    </PublicOnlyRoute>
                  }
                />

                {/* Protected App Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/expenses/new" element={<AddEditExpensePage />} />
                  <Route path="/expenses/:id/edit" element={<AddEditExpensePage />} />
                  <Route path="/budgets" element={<BudgetsPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
