import { useEffect, useState } from 'react';
import { budgetAPI, categoryAPI } from '../api';
import { Budget, Category } from '../types';
import { Plus, Trash2, Target, TrendingDown, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface BudgetForm { amount: number; categoryId: string; month: number; year: number; }

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
    <div className="card animate-fade-up" style={{ width: '100%', maxWidth: '440px', padding: '32px' }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
);

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
    if (!confirm('Delete this budget?')) return;
    await budgetAPI.delete(id); load();
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgets.filter(b => b.spent > b.amount).length;

  return (
    <div style={{ padding: '40px' }}>
      {/* Header */}
      <div className="animate-fade-up stagger-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'Syne', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Budgets</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Spending limits for {MONTHS[month - 1]} {year}</p>
        </div>
        <button onClick={() => { reset({ month, year }); setShowModal(true); }} className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px' }}>
          <Plus size={16} /> Set Budget
        </button>
      </div>

      {/* Month Selector */}
      <div className="animate-fade-up stagger-2" style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
        {MONTHS_SHORT.map((m, i) => {
          const isActive = month === i + 1;
          const isCurrentMonth = now.getMonth() === i && now.getFullYear() === year;
          return (
            <button key={m} onClick={() => setMonth(i + 1)} style={{ padding: '8px 16px', borderRadius: '10px', border: `1px solid ${isActive ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`, background: isActive ? 'var(--brand-glow)' : 'var(--surface-2)', color: isActive ? 'var(--brand-light)' : isCurrentMonth ? '#e2ede3' : 'var(--text-muted)', fontSize: '13px', fontWeight: isActive ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', position: 'relative' }}>
              {m}
              {isCurrentMonth && !isActive && <span style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '3px', height: '3px', borderRadius: '50%', background: 'var(--brand)' }} />}
            </button>
          );
        })}
      </div>

      {/* Summary Cards */}
      {budgets.length > 0 && (
        <div className="animate-fade-up stagger-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Budget', value: totalBudget, color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.15)', icon: Target },
            { label: 'Total Spent', value: totalSpent, color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)', icon: TrendingDown },
            { label: 'Remaining', value: totalBudget - totalSpent, color: totalBudget - totalSpent < 0 ? '#f87171' : '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.15)', icon: totalBudget - totalSpent < 0 ? AlertTriangle : CheckCircle },
          ].map(({ label, value, color, bg, border, icon: Icon }) => (
            <div key={label} className="card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: '20px', fontFamily: 'Syne', fontWeight: 700, color }}>{fmt(value)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

     
      {overBudget > 0 && (
        <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', marginBottom: '20px' }}>
          <AlertTriangle size={16} color="#f87171" />
          <p style={{ fontSize: '13px', color: '#f87171' }}>
            <strong>{overBudget} {overBudget === 1 ? 'category is' : 'categories are'} over budget</strong> this month
          </p>
        </div>
      )}

      {/* Budget List */}
      {budgets.length === 0 ? (
        <div className="card animate-fade-up stagger-3" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Target size={26} color="var(--text-dim)" />
          </div>
          <p style={{ fontSize: '16px', fontFamily: 'Syne', fontWeight: 600, color: '#e2ede3', marginBottom: '6px' }}>No budgets set</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Set spending limits to stay on track this month</p>
          <button onClick={() => { reset({ month, year }); setShowModal(true); }} className="btn-primary" style={{ width: 'auto', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 24px' }}>
            <Plus size={15} /> Set your first budget
          </button>
        </div>
      ) : (
        <div className="animate-fade-up stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {budgets.map((b, i) => {
            const pct = Math.min((b.spent / b.amount) * 100, 100);
            const over = b.spent > b.amount;
            const warn = !over && pct >= 80;
            const barColor = over ? '#f87171' : warn ? '#fb923c' : 'var(--brand)';
            return (
              <div key={b.id} className="card card-hover animate-fade-up" style={{ padding: '22px 24px', animationDelay: `${0.05 * i}s`, opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', background: `${b.category?.color}15`, flexShrink: 0 }}>
                      {b.category?.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#e2ede3', marginBottom: '3px' }}>{b.category?.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {fmt(b.spent)} spent of {fmt(b.amount)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: barColor, marginBottom: '2px' }}>
                        {over ? `+${fmt(b.spent - b.amount)} over` : `${fmt(b.amount - b.spent)} left`}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pct.toFixed(0)}% used</p>
                    </div>
                    {over && <AlertTriangle size={16} color="#f87171" />}
                    {!over && warn && <AlertTriangle size={16} color="#fb923c" />}
                    {!over && !warn && <CheckCircle size={16} color="var(--brand)" />}
                    <button onClick={() => onDelete(b.id)} style={{ padding: '8px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: '6px', borderRadius: '99px', background: 'var(--surface-3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '99px', width: `${pct}%`, background: barColor, transition: 'width 0.6s ease', boxShadow: `0 0 8px ${barColor}60` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title="Set Budget" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Category</label>
              <select {...register('categoryId', { required: true })} className="input">
                <option value="">Select expense category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Budget Amount</label>
              <input {...register('amount', { required: true })} type="number" step="0.01" placeholder="500.00" className="input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Month</label>
                <select {...register('month', { valueAsNumber: true })} className="input">
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Year</label>
                <input {...register('year', { valueAsNumber: true })} type="number" className="input" defaultValue={year} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Budget</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}