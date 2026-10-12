import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
} from 'lucide-react';
import { expenseService, ExpenseFilterParams } from '../../services/expenseService';
import { categoryService } from '../../services/categoryService';
import { Category, Expense, ExpensePageResponse, PaymentMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CategoryIconRenderer } from '../../utils/categoryIcons';
import toast from 'react-hot-toast';

export const ExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currency = user?.currency || 'INR';
  const [searchParams] = useSearchParams();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [quickDate, setQuickDate] = useState<string>('THIS_MONTH');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [sort, setSort] = useState<string>('newest');

  // Modals
  const [selectedExpenseForView, setSelectedExpenseForView] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Safe quick date calculation without mutating base Date
  const computeQuickDates = useCallback((rangeType: string) => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYmd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (rangeType === 'TODAY') {
      const dStr = toYmd(today);
      return { start: dStr, end: dStr };
    }
    if (rangeType === 'THIS_WEEK') {
      const d = new Date(today.getTime());
      const day = d.getDay();
      const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.getFullYear(), d.getMonth(), diffToMonday);
      const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
      return { start: toYmd(monday), end: toYmd(sunday) };
    }
    if (rangeType === 'THIS_MONTH') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start: toYmd(start), end: toYmd(end) };
    }
    if (rangeType === 'LAST_MONTH') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start: toYmd(start), end: toYmd(end) };
    }
    return { start: '', end: '' };
  }, []);

  // Set initial dates from default
  useEffect(() => {
    const defaultRange = user?.defaultDateRange || 'THIS_MONTH';
    setQuickDate(defaultRange);
    const { start, end } = computeQuickDates(defaultRange);
    setStartDate(start);
    setEndDate(end);
  }, [user?.defaultDateRange, computeQuickDates]);

  // Load categories
  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch expenses with active filters
  const fetchExpenses = useCallback(
    async (pageIndex = 0) => {
      try {
        setIsLoading(true);
        const params: ExpenseFilterParams = {
          page: pageIndex,
          size: pagination.size,
          sort,
        };

        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (selectedCategory) params.category = Number(selectedCategory);
        if (selectedPayment) params.paymentMethod = selectedPayment as PaymentMethod;
        if (minAmount) params.minAmount = Number(minAmount);
        if (maxAmount) params.maxAmount = Number(maxAmount);
        if (search.trim()) params.search = search.trim();

        const res: ExpensePageResponse = await expenseService.getExpenses(params);
        setExpenses(res.content);
        setPagination({
          page: res.page,
          size: res.size,
          totalElements: res.totalElements,
          totalPages: res.totalPages,
          first: res.first,
          last: res.last,
        });
      } catch {
        toast.error('Failed to load expenses');
      } finally {
        setIsLoading(false);
      }
    },
    [startDate, endDate, selectedCategory, selectedPayment, minAmount, maxAmount, search, sort, pagination.size]
  );

  useEffect(() => {
    fetchExpenses(0);
  }, [fetchExpenses]);

  const handleQuickDateChange = (val: string) => {
    setQuickDate(val);
    if (val !== 'CUSTOM') {
      const { start, end } = computeQuickDates(val);
      setStartDate(start);
      setEndDate(end);
    }
  };

  const handleClearFilters = () => {
    setQuickDate('THIS_MONTH');
    const { start, end } = computeQuickDates('THIS_MONTH');
    setStartDate(start);
    setEndDate(end);
    setSelectedCategory('');
    setSelectedPayment('');
    setMinAmount('');
    setMaxAmount('');
    setSearch('');
    setSort('newest');
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    try {
      await expenseService.deleteExpense(expenseToDelete.id);
      toast.success('Expense deleted successfully');
      setExpenseToDelete(null);
      fetchExpenses(pagination.page);
    } catch {
      toast.error('Could not delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  const activeFiltersCount =
    (quickDate !== 'THIS_MONTH' ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (selectedPayment ? 1 : 0) +
    (minAmount ? 1 : 0) +
    (maxAmount ? 1 : 0) +
    (search.trim() ? 1 : 0);

  return (
    <div className="space-y-6 text-ink">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Expense Records
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            View, filter, and audit disbursements across your accounts.
          </p>
        </div>
        <Link to="/expenses/new">
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar Card */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink">
            <Filter className="w-4 h-4 text-accent" />
            <span>Filter Transactions</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-accent-subtle text-accent text-[11px] font-bold tabular-nums">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-danger hover:underline font-medium cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Quick Date Range Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'TODAY', label: 'Today' },
            { id: 'THIS_WEEK', label: 'This Week' },
            { id: 'THIS_MONTH', label: 'This Month' },
            { id: 'LAST_MONTH', label: 'Last Month' },
            { id: 'CUSTOM', label: 'Custom Range' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleQuickDateChange(preset.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                quickDate === preset.id
                  ? 'bg-accent text-accent-contrast font-semibold shadow-subtle'
                  : 'bg-surface-elevated text-ink-secondary hover:text-ink hover:bg-surface-subtle'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, notes, category..."
              className="w-full bg-surface-elevated border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
          </div>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Payment Method */}
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="">All Payment Modes</option>
            <option value="UPI">UPI</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CASH">Cash</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-ink focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest">Sort: Highest Amount</option>
              <option value="lowest">Sort: Lowest Amount</option>
              <option value="description a-z">Sort: Description (A-Z)</option>
            </select>
            <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted pointer-events-none" />
          </div>
        </div>

        {/* Custom Range / Amount Range Inputs */}
        {(quickDate === 'CUSTOM' || minAmount || maxAmount) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs border-t border-border/60">
            <div>
              <label className="text-[11px] text-ink-muted block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[11px] text-ink-muted block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[11px] text-ink-muted block mb-1">Min Amount ({currency})</label>
              <input
                type="number"
                placeholder="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent tabular-nums"
              />
            </div>
            <div>
              <label className="text-[11px] text-ink-muted block mb-1">Max Amount ({currency})</label>
              <input
                type="number"
                placeholder="100000"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent tabular-nums"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Main Table / Mobile Cards */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-ink-muted">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No transactions match your criteria"
              description="No entries correspond to the active filter parameters. Adjust your filters or record a new expense."
              actionText="Add New Expense"
              onAction={() => navigate('/expenses/new')}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated border-b border-border text-ink-muted font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-surface-elevated transition-colors"
                    >
                      <td className="py-3.5 px-4 text-ink-secondary whitespace-nowrap">
                        {formatDate(expense.expenseDate)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-ink">
                        <div>{expense.description}</div>
                        {expense.notes && (
                          <div className="text-[11px] text-ink-muted truncate max-w-xs font-normal mt-0.5">
                            {expense.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-subtle border border-border">
                          <CategoryIconRenderer
                            name={expense.category.icon}
                            className="w-3.5 h-3.5"
                            color={expense.category.color}
                          />
                          <span>{expense.category.name}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-ink-secondary">{expense.paymentMethod}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-ink whitespace-nowrap tabular-nums">
                        {formatCurrency(expense.amount, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => setSelectedExpenseForView(expense)}
                            className="p-1 rounded text-ink-muted hover:text-ink transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/expenses/${expense.id}/edit`}
                            className="p-1 rounded text-ink-muted hover:text-accent transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setExpenseToDelete(expense)}
                            className="p-1 rounded text-ink-muted hover:text-danger transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border/60">
              {expenses.map((expense) => (
                <div key={expense.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-ink">{expense.description}</h4>
                      <p className="text-xs text-ink-muted">{formatDate(expense.expenseDate)}</p>
                    </div>
                    <span className="font-bold text-sm text-ink tabular-nums">
                      {formatCurrency(expense.amount, currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-subtle border border-border">
                      <CategoryIconRenderer
                        name={expense.category.icon}
                        className="w-3 h-3"
                        color={expense.category.color}
                      />
                      <span>{expense.category.name}</span>
                    </span>
                    <span className="text-ink-secondary">{expense.paymentMethod}</span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40 text-xs">
                    <button
                      onClick={() => setSelectedExpenseForView(expense)}
                      className="text-ink-secondary hover:underline cursor-pointer"
                    >
                      View
                    </button>
                    <Link
                      to={`/expenses/${expense.id}/edit`}
                      className="text-accent hover:underline font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setExpenseToDelete(expense)}
                      className="text-danger hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Toolbar */}
            <div className="p-4 bg-surface-elevated/40 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-secondary">
              <span className="tabular-nums">
                Showing{' '}
                <span className="font-bold text-ink">
                  {pagination.totalElements === 0 ? 0 : pagination.page * pagination.size + 1}
                </span>{' '}
                to{' '}
                <span className="font-bold text-ink">
                  {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}
                </span>{' '}
                of <span className="font-bold text-ink">{pagination.totalElements}</span> entries
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.first}
                  onClick={() => fetchExpenses(pagination.page - 1)}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>

                {/* Page Indicators */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i)
                    .filter((p) => Math.abs(p - pagination.page) <= 2)
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => fetchExpenses(p)}
                        className={`w-7 h-7 rounded-md text-xs font-semibold tabular-nums cursor-pointer transition-colors ${
                          p === pagination.page
                            ? 'bg-accent text-accent-contrast shadow-subtle'
                            : 'text-ink-secondary hover:bg-surface-elevated'
                        }`}
                      >
                        {p + 1}
                      </button>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.last}
                  onClick={() => fetchExpenses(pagination.page + 1)}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Expense Detail Modal */}
      <Modal
        isOpen={!!selectedExpenseForView}
        onClose={() => setSelectedExpenseForView(null)}
        title="Transaction Details"
        description="Detailed ledger audit for selected entry"
      >
        {selectedExpenseForView && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-border">
              <div>
                <span className="text-ink-muted block mb-0.5">Amount</span>
                <span className="text-xl font-display font-semibold text-ink tabular-nums">
                  {formatCurrency(selectedExpenseForView.amount, currency)}
                </span>
              </div>
              <div>
                <span className="text-ink-muted block mb-0.5">Date</span>
                <span className="text-sm font-semibold text-ink">
                  {formatDate(selectedExpenseForView.expenseDate)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-ink-muted block mb-0.5">Description</span>
              <p className="text-sm font-semibold text-ink">{selectedExpenseForView.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-ink-muted block mb-0.5">Category</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-subtle border border-border mt-0.5">
                  <CategoryIconRenderer
                    name={selectedExpenseForView.category.icon}
                    className="w-3.5 h-3.5"
                    color={selectedExpenseForView.category.color}
                  />
                  <span>{selectedExpenseForView.category.name}</span>
                </span>
              </div>
              <div>
                <span className="text-ink-muted block mb-0.5">Payment Method</span>
                <p className="font-semibold text-ink mt-1">{selectedExpenseForView.paymentMethod}</p>
              </div>
            </div>

            {selectedExpenseForView.notes && (
              <div>
                <span className="text-ink-muted block mb-0.5">Notes</span>
                <p className="text-xs text-ink-secondary bg-surface-elevated p-3 rounded-lg border border-border leading-relaxed">
                  {selectedExpenseForView.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-border gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedExpenseForView(null)}
              >
                Close
              </Button>
              <Link to={`/expenses/${selectedExpenseForView.id}/edit`}>
                <Button variant="primary" size="sm">
                  Edit Entry
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        title="Confirm Transaction Deletion"
        description={`Are you sure you want to delete "${expenseToDelete?.description}"? Your monthly budget will be updated immediately.`}
      >
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" size="sm" onClick={() => setExpenseToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleConfirmDelete}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
