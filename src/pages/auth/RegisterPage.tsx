import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState<'idle' | 'creating' | 'launching'>('idle');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[@#$%^&+=!._\-*?]/.test(pwd)) score++;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  const getStrengthInfo = () => {
    if (!password) return { text: '', color: 'bg-surface-subtle' };
    if (strength <= 2) return { text: 'Weak', color: 'bg-danger' };
    if (strength === 3 || strength === 4) return { text: 'Good', color: 'bg-warning' };
    return { text: 'Strong', color: 'bg-success' };
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address';

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!._\-*?])/.test(password)) {
      errs.password = 'Requires uppercase, lowercase, number and symbol';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setRegisterStep('creating');
    try {
      await register({ name, email, password, confirmPassword });
      setRegisterStep('launching');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 400);
    } catch {
      setRegisterStep('idle');
      setIsLoading(false);
    }
  };

  const strengthInfo = getStrengthInfo();

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-page text-ink selection:bg-accent-subtle selection:text-accent font-sans transition-colors duration-200">
      {/* LEFT PANEL: Showcase */}
      <div className="lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-surface via-surface-elevated to-surface border-b lg:border-b-0 lg:border-r border-border p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-accent-contrast flex items-center justify-center shadow-subtle font-display font-bold text-lg tracking-wider">
              <Wallet className="w-5 h-5 text-accent-contrast" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-ink block leading-none">
                LedgerCraft
              </span>
              <span className="text-[11px] font-medium text-ink-muted uppercase tracking-wider">
                Financial Dashboard
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border bg-surface text-ink-secondary hover:text-ink hover:bg-surface-elevated transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-ink-secondary" />}
          </button>
        </div>

        {/* Middle Feature Showcase */}
        <div className="my-8 lg:my-auto relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent-subtle text-accent border border-accent/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join Thousands Managing Wealth Smarter</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-ink leading-tight">
            Start your journey toward zero-anxiety finances.
          </h1>

          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed max-w-lg">
            Create your account today and gain immediate access to proactive threshold warnings, automated category tagging, and deep spending trend curves.
          </p>

          <div className="space-y-3 pt-2">
            <div className="bg-surface/90 backdrop-blur-sm border border-border rounded-xl p-4 shadow-subtle space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                <PieChart className="w-4 h-4 text-accent" />
                <span>Everything included out-of-the-box:</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-secondary">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Multi-category budgeting
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Live alert thresholds
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> CSV / Export readiness
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Zero clutter or ads
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Trust */}
        <div className="relative z-10 pt-4 border-t border-border flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Private & Isolated SQL Database Storage</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 py-10 relative">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Create Your Account
            </h2>
            <p className="text-xs sm:text-sm text-ink-secondary">
              Set up your ledger in less than 30 seconds.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-card space-y-5">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                icon={<User className="w-4 h-4" />}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                error={errors.name}
                autoComplete="name"
                placeholder="Alex Morgan"
                required
              />

              <Input
                label="Email Address"
                type="email"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                error={errors.email}
                autoComplete="email"
                placeholder="alex@domain.com"
                required
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  icon={<Lock className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  error={errors.password}
                  autoComplete="new-password"
                  placeholder="At least 8 chars with symbols"
                  required
                />

                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-ink-muted">
                      <span>Password strength:</span>
                      <span className="font-semibold text-ink">{strengthInfo.text}</span>
                    </div>
                    <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                        style={{ width: `${(strength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                icon={<Lock className="w-4 h-4" />}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                error={errors.confirmPassword}
                autoComplete="new-password"
                placeholder="Repeat your password"
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full flex items-center justify-center gap-2 group py-3 text-sm font-semibold tracking-wide"
                >
                  {registerStep === 'creating' ? (
                    <span>Registering account...</span>
                  ) : registerStep === 'launching' ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-accent-contrast" />
                      Setting Up Your Dashboard...
                    </span>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-border text-center text-xs text-ink-secondary">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-accent hover:underline ml-1">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
