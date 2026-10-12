import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Coins, FileText } from 'lucide-react';
import { expenseService } from '../../services/expenseService';
import { categoryService } from '../../services/categoryService';
import { Category, PaymentMethod } from '../../types';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const AddEditExpensePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const currencyCode = user?.currency || 'USD';

  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await categoryService.getCategories();
        setCategories(cats);
        if (!categoryId && cats.length > 0) {
          setCategoryId(String(cats[0].id));
        }
      } catch {
        toast.error('Failed to load categories');
      }
    };

    fetchCats();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      const fetchExpense = async () => {
        try {
          setIsFetching(true);
          const exp = await expenseService.getExpenseById(Number(id));
          setAmount(String(exp.amount));
          setDescription(exp.description);
          setCategoryId(String(exp.category.id));
          setExpenseDate(exp.expenseDate);
          setPaymentMethod(exp.paymentMethod);
          setNotes(exp.notes || '');
        } catch {
          toast.error('Could not find expense');
          navigate('/expenses');
        } finally {
          setIsFetching(false);
        }
      };

      fetchExpense();
    }
  }, [id, isEditing, navigate]);

  const validate = () => {
    const errs: Record<string, string> = {};
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Amount must be greater than 0';
    }

    if (!description.trim() || description.trim().length < 2) {
      errs.description = 'Description must be between 2 and 200 characters';
    } else if (description.trim().length > 200) {
      errs.description = 'Description must not exceed 200 characters';
    }

    if (!categoryId) {
      errs.categoryId = 'Please select a category';
    }

    if (!expenseDate) {
      errs.expenseDate = 'Expense date is required';
    }

    if (notes && notes.length > 1000) {
      errs.notes = 'Notes cannot exceed 1000 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const payload = {
      amount: parseFloat(amount),
      description: description.trim(),
      categoryId: Number(categoryId),
      expenseDate,
      paymentMethod,
      notes: notes.trim() || undefined,
    };

    try {
      if (isEditing && id) {
        await expenseService.updateExpense(Number(id), payload);
        toast.success('Expense updated');
      } else {
        await expenseService.createExpense(payload);
        toast.success('Expense recorded');
      }
      navigate('/expenses');
    } catch {
      // toast in interceptor
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-ink-muted text-sm">
        Loading expense details...
      </div>
    );
  }

  const paymentOptions: { value: PaymentMethod; label: string }[] = [
    { value: 'UPI', label: 'UPI' },
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'DEBIT_CARD', label: 'Debit Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CASH', label: 'Cash' },
    { value: 'OTHER', label: 'Other' },
  ];

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/expenses"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to expenses</span>
        </Link>
        <span className="text-xs text-ink-muted tabular-nums">
          Currency: <strong className="text-ink font-semibold">{currencyCode}</strong>
        </span>
      </div>

      <Card>
        <div className="border-b border-border pb-4 mb-6">
          <h2 className="text-xl font-serif font-semibold text-ink">
            {isEditing ? 'Edit Expense' : 'Record an Expense'}
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Logged amounts update your monthly budget tracking and category analytics automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Amount (${currencyCode})`}
              type="number"
              step="0.01"
              min="0.01"
              icon={<Coins className="w-4 h-4" />}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={errors.amount}
              required
            />

            <Input
              label="Date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              error={errors.expenseDate}
              required
            />
          </div>

          <Input
            label="Description"
            type="text"
            placeholder="e.g. Grocery market run, train ticket, office coffee"
            icon={<FileText className="w-4 h-4" />}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categoryOptions}
              error={errors.categoryId}
            />

            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              options={paymentOptions}
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details, tax invoice id, or reimbursement notes..."
              className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink placeholder-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
            {errors.notes && <p className="text-xs text-rose-600 mt-1">{errors.notes}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/expenses')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Record Expense'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
