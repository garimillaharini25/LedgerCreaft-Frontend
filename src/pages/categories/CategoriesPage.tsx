import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Lock, Tag, AlertTriangle } from 'lucide-react';
import { categoryService, CreateCategoryPayload, UpdateCategoryPayload } from '../../services/categoryService';
import { Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { CategoryIconRenderer } from '../../utils/categoryIcons';
import toast from 'react-hot-toast';

const PRESET_ICONS = [
  'utensils', 'car', 'shopping-bag', 'film', 'file-text', 'activity',
  'book-open', 'plane', 'shopping-cart', 'home', 'credit-card', 'tag',
  'coffee', 'heart', 'gift', 'smartphone', 'shield', 'briefcase'
];

const PRESET_COLORS = [
  '#0d5f47', '#1b4d3e', '#2c5282', '#6b46c1', '#b83280', '#c53030',
  '#dd6b20', '#d69e2e', '#319795', '#4a5568', '#4c51bf', '#2f855a'
];

export const CategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('tag');
  const [color, setColor] = useState('#0d5f47');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Delete State
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('tag');
    setColor('#0d5f47');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    if (cat.systemCategory) {
      toast.error('System categories cannot be edited');
      return;
    }
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon);
    setColor(cat.color);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Category name is required' });
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        const payload: UpdateCategoryPayload = {
          name: name.trim(),
          description: description.trim() || undefined,
          icon,
          color,
        };
        await categoryService.updateCategory(editingCategory.id, payload);
        toast.success('Category updated');
      } else {
        const payload: CreateCategoryPayload = {
          name: name.trim(),
          description: description.trim() || undefined,
          icon,
          color,
        };
        await categoryService.createCategory(payload);
        toast.success('Category created');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch {
      // error in interceptor
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      await categoryService.deleteCategory(categoryToDelete.id);
      toast.success(`Category removed. Associated records were safely reassigned to "Other".`);
      setCategoryToDelete(null);
      loadCategories();
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-ink tracking-tight">
            Categories
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            System defaults and custom spending categories with lifetime activity tracking.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreateModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-ink-muted">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-4 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center shrink-0 border border-border"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <CategoryIconRenderer name={cat.icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-ink">{cat.name}</h3>
                      {cat.systemCategory && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-canvas border border-border text-ink-muted">
                          <Lock className="w-2.5 h-2.5" />
                          System
                        </span>
                      )}
                    </div>
                    {cat.description && (
                      <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">{cat.description}</p>
                    )}
                  </div>
                </div>

                {!cat.systemCategory && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1 rounded text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
                      title="Edit category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(cat)}
                      className="p-1 rounded text-ink-muted hover:text-rose-600 hover:bg-canvas transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs tabular-nums">
                <div>
                  <span className="text-ink-muted block text-[10px] uppercase tracking-wider font-semibold">Total Spent</span>
                  <span className="font-semibold text-ink">
                    {formatCurrency(cat.totalSpending, currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-ink-muted block text-[10px] uppercase tracking-wider font-semibold">Records</span>
                  <span className="text-ink font-medium">
                    {cat.transactionCount}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        description="Configure category name, color accent, and icon."
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <Input
            label="Category Name"
            value={name}
            placeholder="e.g. Subscriptions, Pet Care, Education"
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />

          <Input
            label="Description (Optional)"
            value={description}
            placeholder="Brief explanation of expenses grouped here"
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Color Accent
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-all border border-border ${
                    color === c ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : 'opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2 p-2.5 border border-border rounded-md max-h-36 overflow-y-auto bg-canvas/30">
              {PRESET_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`p-2 rounded flex items-center justify-center transition-colors ${
                    icon === i
                      ? 'bg-brand-500 text-white'
                      : 'hover:bg-canvas text-ink-muted hover:text-ink'
                  }`}
                >
                  <CategoryIconRenderer name={i} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Safe Reassignment Modal */}
      <Modal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        title="Delete Custom Category"
        description="Safe reassignment notice"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Safe Reassignment Guaranteed</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                Deleting <strong className="font-semibold">{categoryToDelete?.name}</strong> will never delete expense records. All {categoryToDelete?.transactionCount || 0} existing
                expenses will be automatically moved to the system default <strong>"Other"</strong> category.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCategoryToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={confirmDeleteCategory}
            >
              Reassign & Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
