import React, { useState } from 'react';
import { Settings, Moon, Sun, Bell, Calendar, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { userService } from '../../services/userService';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [selectedTheme, setSelectedTheme] = useState<string>(user?.theme || theme || 'light');
  const [defaultDateRange, setDefaultDateRange] = useState<string>(user?.defaultDateRange || 'THIS_MONTH');
  const [budgetNotificationsEnabled, setBudgetNotificationsEnabled] = useState<boolean>(
    user?.budgetNotificationsEnabled ?? true
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await userService.updateSettings({
        theme: selectedTheme,
        defaultDateRange,
        budgetNotificationsEnabled,
      });

      // Apply theme locally
      setTheme(selectedTheme as 'light' | 'dark');
      updateUser(updated);
      toast.success('Settings saved');
    } catch {
      // toast in interceptor
    } finally {
      setIsSaving(false);
    }
  };

  const dateRangeOptions = [
    { value: 'TODAY', label: 'Today' },
    { value: 'THIS_WEEK', label: 'This Week' },
    { value: 'THIS_MONTH', label: 'This Month (Recommended)' },
    { value: 'LAST_MONTH', label: 'Last Month' },
    { value: 'ALL', label: 'All Time' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-ink tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Interface styling, default query window, and automated budget notifications.
        </p>
      </div>

      <form onSubmit={handleSaveSettings}>
        <Card className="p-6 space-y-6">
          {/* Theme setting */}
          <div className="flex items-center justify-between pb-5 border-b border-border">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-ink flex items-center gap-2">
                {selectedTheme === 'dark' ? <Moon className="w-4 h-4 text-brand-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Interface Theme</span>
              </label>
              <p className="text-xs text-ink-muted">
                Warm paper light mode or deep ink dark mode. Synced to your profile.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-md border border-border bg-canvas">
              <button
                type="button"
                onClick={() => setSelectedTheme('light')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  selectedTheme === 'light'
                    ? 'bg-paper text-ink shadow-sm border border-border'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setSelectedTheme('dark')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  selectedTheme === 'dark'
                    ? 'bg-paper text-ink shadow-sm border border-border'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Default date range setting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-ink flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Default Expense Date Range</span>
              </label>
              <p className="text-xs text-ink-muted">
                Standard query window applied on Expenses and Dashboard overviews.
              </p>
            </div>

            <div className="w-56">
              <Select
                value={defaultDateRange}
                onChange={(e) => setDefaultDateRange(e.target.value)}
                options={dateRangeOptions}
              />
            </div>
          </div>

          {/* Budget notification toggle */}
          <div className="flex items-center justify-between pb-5">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-ink flex items-center gap-2">
                <Bell className="w-4 h-4 text-ink-muted" />
                <span>Budget Threshold Alerts</span>
              </label>
              <p className="text-xs text-ink-muted">
                Generate in-app notifications whenever expenses approach or exceed your monthly budget limit.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={budgetNotificationsEnabled}
                onChange={(e) => setBudgetNotificationsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-paper after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Settings
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
