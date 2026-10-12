import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard Overview';
    if (pathname.startsWith('/expenses/new')) return 'Add New Expense';
    if (pathname.includes('/edit')) return 'Edit Expense';
    if (pathname.startsWith('/expenses')) return 'Expense Transactions';
    if (pathname.startsWith('/budgets')) return 'Monthly Budgets';
    if (pathname.startsWith('/analytics')) return 'Financial Analytics';
    if (pathname.startsWith('/categories')) return 'Expense Categories';
    if (pathname.startsWith('/notifications')) return 'Notifications';
    if (pathname.startsWith('/profile')) return 'User Profile';
    if (pathname.startsWith('/settings')) return 'Preferences & Settings';
    if (pathname.startsWith('/about')) return 'About Expense Tracker';
    return 'Expense Tracker';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header onOpenSidebar={() => setSidebarOpen(true)} title={title} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
