import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/auth-context';
import { AppLayout } from './components/layout/AppLayout';
import { EventLayout } from './components/layout/EventLayout';

// Eagerly loaded public entry pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ToastProvider } from './components/ui/Toast';
import { CookieConsent } from './components/ui/CookieConsent';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Lazily loaded workspace & public legal pages for optimal bundle splitting
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const EventWizardPage = React.lazy(() => import('./pages/EventWizardPage').then((m) => ({ default: m.EventWizardPage })));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));

// Event Workspace Pages
const EventOverviewPage = React.lazy(() => import('./pages/event/EventOverviewPage').then((m) => ({ default: m.EventOverviewPage })));
const BudgetPage = React.lazy(() => import('./pages/event/BudgetPage').then((m) => ({ default: m.BudgetPage })));
const TasksPage = React.lazy(() => import('./pages/event/TasksPage').then((m) => ({ default: m.TasksPage })));
const TimelinePage = React.lazy(() => import('./pages/event/TimelinePage').then((m) => ({ default: m.TimelinePage })));
const VendorsPage = React.lazy(() => import('./pages/event/VendorsPage').then((m) => ({ default: m.VendorsPage })));
const GuestsPage = React.lazy(() => import('./pages/event/GuestsPage').then((m) => ({ default: m.GuestsPage })));
const AIAssistantPage = React.lazy(() => import('./pages/event/AIAssistantPage').then((m) => ({ default: m.AIAssistantPage })));

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '3px solid var(--color-primary-soft)',
              borderTopColor: 'var(--color-primary)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Verifying session...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <React.Suspense
              fallback={
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        border: '3px solid var(--color-primary-soft)',
                        borderTopColor: 'var(--color-primary)',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Loading application module...</span>
                  </div>
                </div>
              }
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Authenticated Workspace Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <DashboardPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/events/new"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <EventWizardPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <SettingsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Nested Event Workspace Routes */}
                <Route
                  path="/events/:eventId"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <EventLayout />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<EventOverviewPage />} />
                  <Route path="budget" element={<BudgetPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="timeline" element={<TimelinePage />} />
                  <Route path="vendors" element={<VendorsPage />} />
                  <Route path="guests" element={<GuestsPage />} />
                  <Route path="assistant" element={<AIAssistantPage />} />
                </Route>

                {/* Fallback 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </React.Suspense>
          </ErrorBoundary>
          <CookieConsent />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
