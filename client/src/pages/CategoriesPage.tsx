import { useEffect, useState } from 'react';
import { categoryAPI } from '../api';
import { Category } from '../types';
import { Plus, Pencil, Trash2, Tag, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface CatForm { name: string; icon: string; color: string; type: 'INCOME' | 'EXPENSE'; }

const ICONS = ['💰','💼','🍔','🚗','🛍️','⚡','🏥','🎬','✈️','📚','🏠','💻','🎵','🏋️','☕','🎮','💊','🐾','🌿','📱','🎓','🍕','🍺','💈','🎁','🔧','🏦','📦','🌊','🎪'];
const COLORS = ['#22c55e','#16a34a','#4ade80','#f97316','#fb923c','#3b82f6','#60a5fa','#a855f7','#c084fc','#ef4444','#f87171','#ec4899','#f472b6','#f59e0b','#fbbf24','#06b6d4','#22d3ee','#8b5cf6','#64748b','#94a3b8'];

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
    <div className="card animate-fade-up" style={{ width: '100%', maxWidth: '480px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
);

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const { register, handleSubmit, reset, watch, setValue } = useForm<CatForm>({
    defaultValues: { icon: '💰', color: '#22c55e', type: 'EXPENSE' }
  });
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
    <div style={{ padding: '40px' }}>
      {/* Header */}
      <div className="animate-fade-up stagger-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'Syne', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Categories</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{categories.length} categories total</p>
        </div>
        <button onClick={openAdd} className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px' }}>
          <Plus size={16} /> New Category
        </button>
      </div>

      {/* Income */}
      <div className="animate-fade-up stagger-2" style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Income — {income.length}</p>
        </div>
        {income.length === 0 ? (
          <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No income categories yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {income.map((c, i) => (
              <div key={c.id} className="card card-hover animate-fade-up" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px', animationDelay: `${0.04 * i}s`, opacity: 0, position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => (e.currentTarget.querySelector('.cat-actions') as HTMLElement)!.style.opacity = '1'}
                onMouseLeave={e => (e.currentTarget.querySelector('.cat-actions') as HTMLElement)!.style.opacity = '0'}>
                <div style={{ width: '42px', height: '42px', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: `${c.color}18`, flexShrink: 0, border: `1px solid ${c.color}30` }}>
                  {c.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#e2ede3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, marginTop: '4px', display: 'inline-block' }} />
                </div>
                <div className="cat-actions" style={{ display: 'flex', gap: '4px', opacity: 0, transition: 'opacity 0.15s' }}>
                  <button onClick={() => openEdit(c)} style={{ padding: '6px', borderRadius: '8px', background: 'var(--surface-4)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', transition: 'all 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e2ede3'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => onDelete(c.id)} style={{ padding: '6px', borderRadius: '8px', background: 'var(--surface-4)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.15)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-4)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense */}
      <div className="animate-fade-up stagger-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f87171' }} />
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#f87171', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Expense — {expense.length}</p>
        </div>
        {expense.length === 0 ? (
          <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No expense categories yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {expense.map((c, i) => (
              <div key={c.id} className="card card-hover animate-fade-up" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px', animationDelay: `${0.04 * i}s`, opacity: 0, position: 'relative' }}
                onMouseEnter={e => (e.currentTarget.querySelector('.cat-actions') as HTMLElement)!.style.opacity = '1'}
                onMouseLeave={e => (e.currentTarget.querySelector('.cat-actions') as HTMLElement)!.style.opacity = '0'}>
                <div style={{ width: '42px', height: '42px', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: `${c.color}18`, flexShrink: 0, border: `1px solid ${c.color}30` }}>
                  {c.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#e2ede3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, marginTop: '4px', display: 'inline-block' }} />
                </div>
                <div className="cat-actions" style={{ display: 'flex', gap: '4px', opacity: 0, transition: 'opacity 0.15s' }}>
                  <button onClick={() => openEdit(c)} style={{ padding: '6px', borderRadius: '8px', background: 'var(--surface-4)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e2ede3'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => onDelete(c.id)} style={{ padding: '6px', borderRadius: '8px', background: 'var(--surface-4)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.15)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-4)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={`${editing ? 'Edit' : 'New'} Category`} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Type */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {(['INCOME', 'EXPENSE'] as const).map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '11px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${selectedType === t ? (t === 'INCOME' ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)') : 'var(--border)'}`, background: selectedType === t ? (t === 'INCOME' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface-3)', color: selectedType === t ? (t === 'INCOME' ? '#4ade80' : '#f87171') : 'var(--text-muted)', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s' }}>
                    <input type="radio" value={t} {...register('type')} style={{ display: 'none' }} />{t}
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Name</label>
              <input {...register('name', { required: true })} placeholder="e.g. Groceries" className="input" />
            </div>

            {/* Icon picker */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '10px' }}>Icon</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
                {ICONS.map(icon => (
                  <button key={icon} type="button" onClick={() => setValue('icon', icon)} style={{ padding: '8px', borderRadius: '10px', border: `1px solid ${selectedIcon === icon ? 'rgba(34,197,94,0.5)' : 'transparent'}`, background: selectedIcon === icon ? 'var(--brand-glow)' : 'var(--surface-3)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, transition: 'all 0.15s', transform: selectedIcon === icon ? 'scale(1.15)' : 'scale(1)' }}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '10px' }}>Color</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setValue('color', c)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: c, border: `2px solid ${selectedColor === c ? '#fff' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s', transform: selectedColor === c ? 'scale(1.2)' : 'scale(1)', outline: selectedColor === c ? `3px solid ${c}50` : 'none', outlineOffset: '2px' }} />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{ padding: '14px 16px', borderRadius: '14px', background: 'var(--surface-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: `${selectedColor}18`, border: `1px solid ${selectedColor}30` }}>
                {selectedIcon}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#e2ede3' }}>Preview</p>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedColor, marginTop: '3px', display: 'inline-block' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editing ? 'Save Changes' : 'Create Category'}</button>
            </div>
          </form>
        </Modal>
      )}

      {categories.length === 0 && (
        <div className="card animate-fade-up stagger-4" style={{ padding: '60px', textAlign: 'center', marginTop: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Tag size={26} color="var(--text-dim)" />
          </div>
          <p style={{ fontSize: '16px', fontFamily: 'Syne', fontWeight: 600, color: '#e2ede3', marginBottom: '6px' }}>No categories yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Create categories to organize your transactions</p>
        </div>
      )}
    </div>
  );
}