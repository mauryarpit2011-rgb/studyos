import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui';
import { AppShell } from '@/components/layout';
import { Dashboard } from '@/components/dashboard';
import { TasksPage } from '@/components/tasks';
import { NotesPage } from '@/components/notes';
import { PlannerPage } from '@/components/planner';
import { FocusPage } from '@/components/focus';
import { AnalyticsPage } from '@/components/analytics';
import { SearchPage } from '@/components/search';
import { SettingsPage } from '@/components/settings';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/planner" element={<PlannerPage />} />
      <Route path="/focus" element={<FocusPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </BrowserRouter>
    </ToastProvider>
  );
}