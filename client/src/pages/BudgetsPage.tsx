import { useEffect, useState } from 'react';
import { budgetAPI, categoryAPI } from '../api';
import { Budget, Category } from '../types';
import { Plus, Trash2, Target } from 'lucide-react';
import { useForm } from 'react-hook-form';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface BudgetForm { amount: number; categoryId: string; month: number; year: number; }

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm<BudgetForm>({ defaultValues: { month, year } });

  const load = () => budgetAPI.getAll({ month, year }).then(r => setBudgets(r.data));
  useEffect(() => { load(); }, [month, year]);
  useEffect(() => { categoryAPI.getAll().then(r => setCategories(r.data.filter((c: Category) => c.type === 'EXPENSE'))); }, []);

  const onSubmit = async (data: BudgetForm) => {
    await budgetAPI.upsert({ ...data, amount: Number(data.amount) });
    setShowModal(false); load();
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete budget?')) return;
    await budgetAPI.delete(id); load();
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Budgets</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Monthly spending limits</p>
        </div>
        <button onClick={() => { reset({ month, year }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black" style={{ background: 'var(--brand)' }}>
          <Plus size={16} /> Set Budget
        </button>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1">
        {MONTHS.map((m, i) => (
          <button key={m} onClick={() => setMonth(i + 1)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${month === i + 1 ? 'text-black' : 'text-gray-400 hover:text-white'}`}
            style={month === i + 1 ? { background: 'var(--brand)' } : { background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            {m} {year}
          </button>
        ))}
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Budget', value: totalBudget, color: '#22c55e' },
            { label: 'Total Spent', value: totalSpent, color: '#ef4444' },
            { label: 'Remaining', value: totalBudget - totalSpent, color: totalBudget - totalSpent < 0 ? '#ef4444' : '#f59e0b' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4">
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-xl font-display font-bold" style={{ color }}>{fmt(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <div className="card p-12 text-center">
          <Target size={32} className="mx-auto mb-3 opacity-30 text-green-500" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No budgets set for this month</p>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map(b => {
            const pct = Math.min((b.spent / b.amount) * 100, 100);
            const over = b.spent > b.amount;
            return (
              <div key={b.id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `${b.category?.color}20` }}>
                      {b.category?.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{b.category?.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(b.spent)} / {fmt(b.amount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold font-mono ${over ? 'text-red-400' : 'text-green-400'}`}>
                      {over ? 'Over by ' : ''}{fmt(Math.abs(b.amount - b.spent))} {!over ? 'left' : ''}
                    </span>
                    <button onClick={() => onDelete(b.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400" style={{ color: 'var(--text-muted)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: over ? '#ef4444' : pct > 80 ? '#f59e0b' : 'var(--brand)' }} />
                </div>
                <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</p>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="card w-full max-w-md p-6">
            <h3 className="text-xl font-display font-bold text-white mb-6">Set Budget</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Category</label>
                <select {...register('categoryId', { required: true })} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Budget Amount</label>
                <input {...register('amount', { required: true })} type="number" placeholder="500.00" className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Month</label>
                  <select {...register('month')} className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Year</label>
                  <input {...register('year')} type="number" className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black" style={{ background: 'var(--brand)' }}>Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}