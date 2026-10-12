import React, { useState } from 'react';
import { User, Lock, Save, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const updated = await userService.updateProfile({ name: name.trim(), currency });
      updateUser(updated);
      toast.success('Profile updated');
    } catch {
      // toast in interceptor
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!currentPassword) errs.currentPassword = 'Enter current password';
    if (!newPassword) errs.newPassword = 'Enter new password';
    else if (newPassword.length < 8) errs.newPassword = 'Must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!._\-*?])/.test(newPassword)) {
      errs.newPassword = 'Requires uppercase, lowercase, digit & symbol';
    }

    if (newPassword !== confirmNewPassword) {
      errs.confirmNewPassword = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }

    setIsChangingPassword(true);
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordErrors({});
    } catch {
      // toast in interceptor
    } finally {
      setIsChangingPassword(false);
    }
  };

  const currencyOptions = [
    { value: 'USD', label: 'USD ($ - US Dollar)' },
    { value: 'EUR', label: 'EUR (€ - Euro)' },
    { value: 'GBP', label: 'GBP (£ - British Pound)' },
    { value: 'INR', label: 'INR (₹ - Indian Rupee)' },
    { value: 'JPY', label: 'JPY (¥ - Japanese Yen)' },
    { value: 'CAD', label: 'CAD ($ - Canadian Dollar)' },
    { value: 'AUD', label: 'AUD ($ - Australian Dollar)' },
    { value: 'SGD', label: 'SGD ($ - Singapore Dollar)' },
    { value: 'CHF', label: 'CHF (CHF - Swiss Franc)' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-ink tracking-tight">
          User Profile
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Personal identification, base ledger currency, and security credentials.
        </p>
      </div>

      {/* Profile Details Form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h2 className="font-serif font-semibold text-base text-ink">Personal Information</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="text-ink-muted text-xs font-medium uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <input
                type="text"
                value={user?.email || ''}
                disabled
                className="w-full bg-canvas/60 border border-border rounded-md px-3 py-2 text-xs text-ink-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="sm:w-1/2">
            <Select
              label="Primary Ledger Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={currencyOptions}
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdatingProfile}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <Shield className="w-4 h-4 text-ink-muted" />
          <h2 className="font-serif font-semibold text-base text-ink">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <Input
            label="Current Password"
            type="password"
            icon={<Lock className="w-4 h-4" />}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={passwordErrors.currentPassword}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              icon={<Lock className="w-4 h-4" />}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passwordErrors.newPassword}
              helperText="Min 8 chars with uppercase, lowercase, digit, & symbol"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              icon={<Lock className="w-4 h-4" />}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              error={passwordErrors.confirmNewPassword}
              required
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isChangingPassword}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
