import { useEffect, useState } from 'react';
import { categoryAPI } from '../api';
import { Category } from '../types';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface CatForm { name: string; icon: string; color: string; type: 'INCOME' | 'EXPENSE'; }

const ICONS = ['💰', '💼', '🍔', '🚗', '🛍️', '⚡', '🏥', '🎬', '✈️', '📚', '🏠', '💻', '🎵', '🏋️', '☕', '🎮', '💊', '🐾', '🌿', '📱'];
const COLORS = ['#22c55e', '#16a34a', '#f97316', '#3b82f6', '#a855f7', '#ef4444', '#ec4899', '#f59e0b', '#06b6d4', '#8b5cf6', '#64748b', '#10b981'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const { register, handleSubmit, reset, watch, setValue } = useForm<CatForm>({ defaultValues: { icon: '💰', color: '#22c55e', type: 'EXPENSE' } });
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');
  const selectedType = watch('type');

  const load = () => categoryAPI.getAll().then(r => setCategories(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); reset({ icon: '💰', color: '#22c55e', type: 'EXPENSE' }); setShowModal(true); };
  const openEdit = (c: Category) => { setEditing(c); reset({ name: c.name, icon: c.icon, color: c.color, type: c.type }); setShowModal(true); };

  const onSubmit = async (data: CatForm) => {
    if (editing) await categoryAPI.update(editing.id, data);
    else await categoryAPI.create(data);
    setShowModal(false); load();
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await categoryAPI.delete(id); load();
  };

  const income = categories.filter(c => c.type === 'INCOME');
  const expense = categories.filter(c => c.type === 'EXPENSE');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Categories</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{categories.length} categories</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black" style={{ background: 'var(--brand)' }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {[{ label: 'Income', items: income, color: 'text-green-400' }, { label: 'Expense', items: expense, color: 'text-red-400' }].map(({ label, items, color }) => (
        <div key={label} className="mb-8">
          <h2 className={`text-sm font-semibold uppercase tracking-widest mb-4 ${color}`}>{label}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {items.map(c => (
              <div key={c.id} className="card p-4 flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${c.color}20` }}>{c.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.name}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-muted)' }}><Pencil size={13} /></button>
                  <button onClick={() => onDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400" style={{ color: 'var(--text-muted)' }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="card w-full max-w-md p-6">
            <h3 className="text-xl font-display font-bold text-white mb-6">{editing ? 'Edit' : 'New'} Category</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Name</label>
                <input {...register('name', { required: true })} placeholder="Category name" className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['INCOME', 'EXPENSE'] as const).map(t => (
                    <label key={t} className={`flex items-center justify-center p-3 rounded-xl cursor-pointer border transition-all text-sm font-medium ${selectedType === t ? (t === 'INCOME' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400') : 'text-gray-500'}`}
                      style={{ background: 'var(--surface-3)', borderColor: selectedType === t ? undefined : 'var(--border)' }}>
                      <input type="radio" value={t} {...register('type')} className="sr-only" />{t}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Icon</label>
                <div className="grid grid-cols-10 gap-1.5">
                  {ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setValue('icon', icon)}
                      className={`p-2 rounded-lg text-xl transition-all hover:scale-110 ${selectedIcon === icon ? 'ring-2 ring-green-500' : ''}`}
                      style={{ background: 'var(--surface-3)' }}>{icon}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setValue('color', c)}
                      className={`w-7 h-7 rounded-lg transition-all hover:scale-110 ${selectedColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black" style={{ background: 'var(--brand)' }}>{editing ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}