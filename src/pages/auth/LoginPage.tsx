import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Wallet,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Sparkles,
  Sun,
  Moon,
  Zap,
  CheckCircle2,
  HelpCircle,
  X,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<'idle' | 'authenticating' | 'launching'>('idle');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Preload dashboard chunk when user arrives on login page
  useEffect(() => {
    const preload = () => {
      import('../dashboard/DashboardPage').catch(() => {});
    };
    const timer = setTimeout(preload, 1200);
    return () => clearTimeout(timer);
  }, []);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePerformLogin = async (loginEmail: string, loginPass: string) => {
    setIsLoading(true);
    setLoginStep('authenticating');
    try {
      await login({ email: loginEmail, password: loginPass }, rememberMe);
      setLoginStep('launching');
      
      // Short delay for smooth visual transition to the main dashboard
      setTimeout(() => {
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }, 400);
    } catch {
      setLoginStep('idle');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await handlePerformLogin(email, password);
  };

  const handleQuickDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
    await handlePerformLogin(demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-page text-ink selection:bg-accent-subtle selection:text-accent font-sans transition-colors duration-200">
      {/* LEFT PANEL: Interactive FinTech Showcase & Project Relevance (visible on lg screens, collapsed banner on mobile) */}
      <div className="lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-surface via-surface-elevated to-surface border-b lg:border-b-0 lg:border-r border-border p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background ambient glow */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Brand & Theme Toggle */}
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

          {/* Quick theme toggle */}
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

        {/* Middle Feature Showcase: Project Relevance */}
        <div className="my-8 lg:my-auto relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent-subtle text-accent border border-accent/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Precision Personal Finance & Ledger</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-ink leading-tight">
            Clarity for your cash flow. Guardrails for your wealth.
          </h1>

          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed max-w-lg">
            Track expenses effortlessly with category ceilings, real-time threshold notifications, and longitudinal spending reports.
          </p>

          {/* Interactive FinTech Simulation Cards */}
          <div className="space-y-3 pt-2">
            {/* Live Monthly Budget Card Preview */}
            <div className="bg-surface/90 backdrop-blur-sm border border-border rounded-xl p-4 shadow-subtle transition-transform hover:-translate-y-0.5 duration-200">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-ink flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-accent" />
                  October Budget Utilization
                </span>
                <span className="text-[11px] font-semibold text-accent bg-accent-subtle px-2 py-0.5 rounded-full">
                  68% Spent &bull; On Track
                </span>
              </div>
              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-accent rounded-full transition-all duration-500 w-[68%]" />
              </div>
              <div className="flex justify-between items-center text-[11px] text-ink-muted">
                <span>Spent: <strong className="text-ink font-semibold">₹27,200</strong></span>
                <span>Budget: <strong className="text-ink font-semibold">₹40,000</strong></span>
                <span className="text-success font-medium">₹12,800 left</span>
              </div>
            </div>

            {/* Mini Transaction Stream Preview */}
            <div className="hidden sm:grid grid-cols-2 gap-2 text-xs">
              <div className="bg-surface/80 border border-border rounded-lg p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-accent-subtle text-accent flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-ink leading-tight">Groceries</p>
                    <p className="text-[10px] text-ink-muted">Blinkit Pantry</p>
                  </div>
                </div>
                <span className="font-semibold text-ink text-xs tabular-nums">-₹3,450</span>
              </div>

              <div className="bg-surface/80 border border-border rounded-lg p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-accent-subtle text-accent flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-ink leading-tight">Apartment Rent</p>
                    <p className="text-[10px] text-ink-muted">NEFT Transfer</p>
                  </div>
                </div>
                <span className="font-semibold text-ink text-xs tabular-nums">-₹15,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security / Trust Footer */}
        <div className="relative z-10 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Bank-grade JWT Auth & Rate Limiting</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span>TiDB Cloud Distributed SQL</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Seamless Login Form & Quick Access */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 py-10 relative">
        <div className="w-full max-w-md space-y-6">
          {/* Header block for Form */}
          <div className="text-center sm:text-left space-y-1">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Sign In to Your Ledger
            </h2>
            <p className="text-xs sm:text-sm text-ink-secondary">
              Welcome back. Enter your credentials or use instant demo access.
            </p>
          </div>

          {/* Quick Demo Access Bar for Seamless Testing */}
          <div className="bg-surface-elevated border border-border rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-warning fill-warning" />
                Quick 1-Click Demo Login
              </span>
              <span className="text-[10px] uppercase tracking-wider text-accent font-semibold px-1.5 py-0.5 rounded bg-accent-subtle">
                Instant Access
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('demo@expensetracker.com', 'Demo@123')}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-surface border border-border hover:border-accent hover:bg-accent-subtle/50 text-ink transition-all cursor-pointer shadow-subtle group"
              >
                <span>Demo User</span>
                <ArrowRight className="w-3 h-3 text-ink-muted group-hover:text-accent group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('user2@expensetracker.com', 'Demo@123')}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-surface border border-border hover:border-accent hover:bg-accent-subtle/50 text-ink transition-all cursor-pointer shadow-subtle group"
              >
                <span>Sarah J.</span>
                <ArrowRight className="w-3 h-3 text-ink-muted group-hover:text-accent group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Main Credentials Form Card */}
          <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-card space-y-5">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                placeholder="you@domain.com"
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-ink-secondary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-accent focus:ring-accent cursor-pointer w-3.5 h-3.5"
                  />
                  <span>Remember this device</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-medium text-accent hover:underline text-xs"
                >
                  Forgot password?
                </button>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full flex items-center justify-center gap-2 group py-3 text-sm font-semibold tracking-wide"
                >
                  {loginStep === 'authenticating' ? (
                    <span>Verifying session...</span>
                  ) : loginStep === 'launching' ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-accent-contrast" />
                      Opening Dashboard...
                    </span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-border text-center text-xs text-ink-secondary">
              Don&apos;t have an account yet?{' '}
              <Link to="/register" className="font-semibold text-accent hover:underline ml-1">
                Create an account
              </Link>
            </div>
          </div>

          {/* Quick Security Notice */}
          <p className="text-center text-[11px] text-ink-muted">
            Protected by sliding-window rate limit &bull; AES & SHA-256 JWT validation
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface border border-border rounded-xl shadow-card w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-ink">
                <HelpCircle className="w-5 h-5 text-accent" />
                <h3 className="font-display text-lg font-semibold">Account Recovery</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSubmitted(false);
                }}
                className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-surface-elevated"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="space-y-3 py-2 text-center">
                <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs text-ink font-medium">Recovery instructions dispatched</p>
                <p className="text-[11px] text-ink-muted">
                  If <span className="font-semibold text-ink">{forgotEmail}</span> matches a registered account, you will receive password reset instructions.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSubmitted(false);
                  }}
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Enter your account email to receive a password recovery link. For demo accounts, use password <code className="bg-surface-elevated px-1 py-0.5 rounded text-accent font-semibold font-mono">Demo@123</code>.
                </p>
                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="demo@expensetracker.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (forgotEmail.trim()) {
                        setForgotSubmitted(true);
                      }
                    }}
                  >
                    Send Instructions
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
