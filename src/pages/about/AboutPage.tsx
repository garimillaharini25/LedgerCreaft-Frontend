import React from 'react';
import { Database, Shield, Server, Layout, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-ink tracking-tight">
          About Expense Tracker
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          A personal ledger and budget intelligence application built for financial clarity.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-base font-serif font-semibold text-ink mb-2">
          Design & Purpose
        </h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          Expense Tracker provides intentional spending guardrails through multi-currency expense logging, configurable monthly budgets, category-specific caps, and real-time threshold notifications. All persistent state is owned by a secure relational database with strict multi-tenant boundary checks.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <Server className="w-4 h-4" />
            <h3 className="font-semibold text-sm text-ink">Backend Architecture</h3>
          </div>
          <ul className="text-xs text-ink-muted space-y-2 list-disc list-inside">
            <li>Java 21 LTS with Spring Boot 3 & Maven</li>
            <li>Layered Controller &rarr; Service &rarr; Repository design</li>
            <li>Stateless Spring Security with BCrypt & JWT token filter</li>
            <li>Sliding window login rate limiting and security headers</li>
            <li>Precision monetary calculation using <code>BigDecimal</code></li>
            <li>Health status monitoring via Spring Boot Actuator</li>
          </ul>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <Database className="w-4 h-4" />
            <h3 className="font-semibold text-sm text-ink">Database & Persistence</h3>
          </div>
          <ul className="text-xs text-ink-muted space-y-2 list-disc list-inside">
            <li>TiDB Cloud (MySQL-compatible distributed SQL)</li>
            <li>Strict TLS with verified identity enforcement</li>
            <li>Flyway migration ownership for versioned DDL schemas</li>
            <li>Composite indexing on <code>(user_id, expense_date)</code></li>
            <li>In-memory H2 compatibility mode for isolated unit testing</li>
          </ul>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <Layout className="w-4 h-4" />
            <h3 className="font-semibold text-sm text-ink">Frontend Interface</h3>
          </div>
          <ul className="text-xs text-ink-muted space-y-2 list-disc list-inside">
            <li>React 18 + Vite + TypeScript</li>
            <li>Warm editorial paper design system with Tailwind CSS</li>
            <li>Self-hosted typography (Newsreader serif + DM Sans body)</li>
            <li>Dynamic Recharts data visualizers with theme token synchronization</li>
            <li>Full keyboard accessibility and WCAG AA contrast standards</li>
          </ul>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <Shield className="w-4 h-4" />
            <h3 className="font-semibold text-sm text-ink">Tenant Isolation & Safety</h3>
          </div>
          <ul className="text-xs text-ink-muted space-y-2 list-disc list-inside">
            <li>Authenticated identity derived solely from security context</li>
            <li>Isolated user scoping on every repository query and mutation</li>
            <li>Protected system categories with safe reassignment to "Other"</li>
            <li>Comprehensive exception handling with zero stack trace leakage</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
