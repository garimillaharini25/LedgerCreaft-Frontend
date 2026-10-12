import React, { useEffect, useState } from 'react';
import {
  Wallet,
  Plus,
  AlertTriangle,
  Edit,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';
import { budgetService } from '../../services/budgetService';
import { categoryService } from '../../services/categoryService';
import { MonthlyBudget, Category } from '../../types';
import { formatCurrency, formatMonthName } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { CategoryIconRenderer } from '../../utils/categoryIcons';
import toast from 'react-hot-toast';

export const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [currentBudget, setCurrentBudget] = useState<MonthlyBudget | null>(null);
  const [allBudgets, setAllBudgets] = useState<MonthlyBudget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Budget Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState('');
  const [warningThresholdInput, setWarningThresholdInput] = useState('80');
  const [categoryAllocations, setCategoryAllocations] = useState<{ categoryId: number; amount: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [budgetToDelete, setBudgetToDelete] = useState<MonthlyBudget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [cats, historyBudgets, activeBudget] = await Promise.all([
        categoryService.getCategories(),
        budgetService.getAllBudgets(),
        budgetService.getBudgetByYearAndMonth(selectedYear, selectedMonth),
      ]);
      setCategories(cats);
      setAllBudgets(historyBudgets);
      setCurrentBudget(activeBudget);
    } catch {
      toast.error('Failed to load budget data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const openCreateOrEditModal = () => {
    if (currentBudget && currentBudget.id) {
      setIsEditing(true);
      setTotalBudgetInput(String(currentBudget.totalBudget));
      setWarningThresholdInput(String(currentBudget.warningThreshold));
      const allocs = categories.map((cat) => {
        const found = currentBudget.categories?.find((c) => c.categoryId === cat.id);
        return {
          categoryId: cat.id,
          amount: found ? String(found.budgetAmount) : '0',
        };
      });
      setCategoryAllocations(allocs);
    } else {
      setIsEditing(false);
      setTotalBudgetInput('2000');
      setWarningThresholdInput('80');
      const allocs = categories.map((cat) => ({
        categoryId: cat.id,
        amount: '0',
      }));
      setCategoryAllocations(allocs);
    }
    setIsModalOpen(true);
  };

  const handleAllocationChange = (catId: number, val: string) => {
    setCategoryAllocations((prev) =>
      prev.map((a) => (a.categoryId === catId ? { ...a, amount: val } : a))
    );
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const tot = parseFloat(totalBudgetInput);
    const thresh = parseInt(warningThresholdInput, 10);

    if (isNaN(tot) || tot < 0) {
      toast.error('Please enter a valid total budget amount');
      return;
    }
    if (isNaN(thresh) || thresh < 1 || thresh > 100) {
      toast.error('Warning threshold must be between 1% and 100%');
      return;
    }

    const validCategories = categoryAllocations
      .map((a) => ({
        categoryId: a.categoryId,
        amount: parseFloat(a.amount) || 0,
      }))
      .filter((a) => a.amount > 0);

    setIsSaving(true);
    try {
      if (isEditing && currentBudget?.id) {
        await budgetService.updateBudget(currentBudget.id, {
          totalBudget: tot,
          warningThreshold: thresh,
          categories: validCategories,
        });
        toast.success('Budget updated');
      } else {
        await budgetService.createBudget({
          month: selectedMonth,
          year: selectedYear,
          totalBudget: tot,
          warningThreshold: thresh,
          categories: validCategories,
        });
        toast.success('Budget created');
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      // toast in axios interceptor
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!budgetToDelete || !budgetToDelete.id) return;
    try {
      setIsDeleting(true);
      await budgetService.deleteBudget(budgetToDelete.id);
      toast.success('Budget removed');
      setBudgetToDelete(null);
      loadData();
    } catch {
      toast.error('Could not delete budget');
    } finally {
      setIsDeleting(false);
    }
  };

  const spent = currentBudget?.spent || 0;
  const total = currentBudget?.totalBudget || 0;
  const remaining = currentBudget?.remaining || 0;
  const percentage = currentBudget?.percentage || 0;
  const isOver = currentBudget?.isOverBudget || false;
  const isWarn = currentBudget?.isWarning || false;

  return (
    <div className="space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-ink tracking-tight">
            Budgets
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Set monthly spending caps, configure category ceilings, and monitor pace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-paper border border-border rounded-md px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {formatMonthName(m)}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-paper border border-border rounded-md px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="md"
            onClick={openCreateOrEditModal}
            leftIcon={currentBudget?.id ? <Edit className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          >
            {currentBudget?.id ? 'Edit Budget' : 'Set Budget'}
          </Button>
        </div>
      </div>

      {/* Main Budget Card */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {formatMonthName(selectedMonth)} {selectedYear}
              </span>
              {isOver ? (
                <Badge variant="danger">Over Budget</Badge>
              ) : isWarn ? (
                <Badge variant="warning">Warning: {currentBudget?.warningThreshold}% Reached</Badge>
              ) : total > 0 ? (
                <Badge variant="success">On Track</Badge>
              ) : (
                <Badge variant="default">No Budget Set</Badge>
              )}
            </div>

            <div className="mt-3 flex items-baseline gap-4">
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider">Total Spent</p>
                <p className="text-3xl font-serif font-bold text-ink tabular-nums mt-0.5">
                  {formatCurrency(spent, currency)}
                </p>
              </div>
              <span className="text-border text-2xl font-light">/</span>
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider">Budget Cap</p>
                <p className="text-3xl font-serif font-semibold text-ink-muted tabular-nums mt-0.5">
                  {formatCurrency(total, currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-left lg:text-right">
              <p className="text-xs text-ink-muted uppercase tracking-wider">Remaining Balance</p>
              <p
                className={`text-2xl font-serif font-semibold tabular-nums mt-0.5 ${
                  remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-brand-600 dark:text-brand-400'
                }`}
              >
                {formatCurrency(remaining, currency)}
              </p>
            </div>
            <div className="w-16 h-16 rounded-md border border-border bg-canvas flex flex-col items-center justify-center">
              <span className="text-base font-bold text-ink tabular-nums">{percentage.toFixed(0)}%</span>
              <span className="text-[10px] uppercase tracking-wider text-ink-muted">Used</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-ink-muted tabular-nums mb-2">
            <span>0%</span>
            <span>Alert threshold: {currentBudget?.warningThreshold || 80}%</span>
            <span>100%</span>
          </div>
          <div className="w-full bg-canvas h-2.5 rounded-full overflow-hidden relative border border-border">
            <div
              className={`h-full transition-all duration-500 ${
                isOver ? 'bg-rose-500' : isWarn ? 'bg-amber-500' : 'bg-brand-500'
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
            {/* Warning indicator line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-ink/40"
              style={{ left: `${currentBudget?.warningThreshold || 80}%` }}
              title={`Warning threshold at ${currentBudget?.warningThreshold || 80}%`}
            />
          </div>
        </div>
      </Card>

      {/* Category Budgets Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-serif font-semibold text-ink">
            Category Ceilings
          </h2>
          <p className="text-xs text-ink-muted">Allocated spending caps per category for this month.</p>
        </div>

        {currentBudget?.categories && currentBudget.categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentBudget.categories.map((catBudget) => {
              const catSpent = catBudget.spentAmount || 0;
              const catLimit = catBudget.budgetAmount || 0;
              const catPct = catBudget.percentageUsed || 0;
              const catIsOver = catLimit > 0 && catSpent > catLimit;

              return (
                <Card key={catBudget.id || catBudget.categoryId} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center border border-border"
                        style={{
                          backgroundColor: `${catBudget.categoryColor || '#0d5f47'}12`,
                          color: catBudget.categoryColor || '#0d5f47',
                        }}
                      >
                        <CategoryIconRenderer
                          name={catBudget.categoryIcon || 'tag'}
                          className="w-3.5 h-3.5"
                        />
                      </div>
                      <span className="font-semibold text-xs text-ink">
                        {catBudget.categoryName}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded border ${
                        catIsOver
                          ? 'border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                          : 'border-border bg-canvas text-ink-muted'
                      }`}
                    >
                      {catPct.toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs tabular-nums">
                    <span className="text-ink-muted">
                      Spent: <strong className="text-ink font-semibold">{formatCurrency(catSpent, currency)}</strong>
                    </span>
                    <span className="text-ink-muted">
                      Cap: <strong className="text-ink font-semibold">{formatCurrency(catLimit, currency)}</strong>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-canvas h-1.5 rounded-full overflow-hidden border border-border">
                    <div
                      className={`h-full transition-all duration-300 ${
                        catIsOver ? 'bg-rose-500' : 'bg-brand-500'
                      }`}
                      style={{ width: `${Math.min(100, catPct)}%` }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-8 text-xs text-ink-muted">
            No category-specific caps defined for {formatMonthName(selectedMonth)} {selectedYear}. Use "Set Budget" to allocate limits across categories.
          </Card>
        )}
      </div>

      {/* Historical Budgets List */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h3 className="text-sm font-serif font-semibold text-ink">
            Monthly History
          </h3>
        </div>

        {allBudgets.length === 0 ? (
          <p className="text-xs text-ink-muted py-6 text-center">No historical budgets configured yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-ink-muted font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Budget</th>
                  <th className="py-2.5 px-3">Spent</th>
                  <th className="py-2.5 px-3">Remaining</th>
                  <th className="py-2.5 px-3">Utilization</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allBudgets.map((b) => (
                  <tr key={b.id} className="hover:bg-canvas/60 transition-colors">
                    <td className="py-3 px-3 font-medium text-ink">
                      {formatMonthName(b.month)} {b.year}
                    </td>
                    <td className="py-3 px-3 tabular-nums">{formatCurrency(b.totalBudget, currency)}</td>
                    <td className="py-3 px-3 tabular-nums font-semibold text-ink">{formatCurrency(b.spent, currency)}</td>
                    <td className="py-3 px-3 tabular-nums">{formatCurrency(b.remaining, currency)}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold tabular-nums border ${
                          b.isOverBudget
                            ? 'border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                            : b.isWarning
                            ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                            : 'border-border bg-canvas text-ink-muted'
                        }`}
                      >
                        {b.percentage.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => {
                            setSelectedMonth(b.month);
                            setSelectedYear(b.year);
                          }}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setBudgetToDelete(b)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit Budget: ${formatMonthName(selectedMonth)} ${selectedYear}` : `Set Budget: ${formatMonthName(selectedMonth)} ${selectedYear}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveBudget} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`Monthly Budget (${currency})`}
              type="number"
              step="10"
              value={totalBudgetInput}
              onChange={(e) => setTotalBudgetInput(e.target.value)}
              required
            />
            <Input
              label="Warning Threshold (%)"
              type="number"
              min="1"
              max="100"
              value={warningThresholdInput}
              onChange={(e) => setWarningThresholdInput(e.target.value)}
              helperText="Generates in-app alert when reached"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Category Spending Caps
            </label>
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 border border-border rounded-md p-3 bg-canvas/30">
              {categories.map((cat) => {
                const currentAlloc = categoryAllocations.find((a) => a.categoryId === cat.id)?.amount || '0';
                return (
                  <div key={cat.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 truncate">
                      <CategoryIconRenderer name={cat.icon} className="w-3.5 h-3.5" color={cat.color} />
                      <span className="text-ink font-medium truncate">{cat.name}</span>
                    </div>
                    <div className="w-32 shrink-0">
                      <input
                        type="number"
                        placeholder="0"
                        value={currentAlloc}
                        onChange={(e) => handleAllocationChange(cat.id, e.target.value)}
                        className="w-full bg-paper border border-border rounded px-2.5 py-1 text-xs text-right text-ink tabular-nums focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Budget Confirmation Modal */}
      <Modal
        isOpen={Boolean(budgetToDelete)}
        onClose={() => setBudgetToDelete(null)}
        title="Delete Budget"
        description="Are you sure you want to delete this monthly budget?"
      >
        <div className="space-y-4">
          <p className="text-xs text-ink-muted">
            Deleting this budget will remove threshold alerts for this month. All logged expenses will remain intact.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setBudgetToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleDeleteBudget}>
              Delete Budget
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
