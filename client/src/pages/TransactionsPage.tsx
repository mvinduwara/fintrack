import { useEffect, useState, useCallback } from 'react';
import { transactionAPI, categoryAPI } from '../api';
import { Transaction, Category } from '../types';
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

interface TxForm { amount: number; description: string; type: 'INCOME' | 'EXPENSE'; date: string; categoryId: string; }

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
    <div className="card animate-fade-up" style={{ width: '100%', maxWidth: '460px', padding: '32px' }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
);

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState({ type: '', categoryId: '' });
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, watch } = useForm<TxForm>({
    defaultValues: { date: format(new Date(), 'yyyy-MM-dd'), type: 'EXPENSE' }
  });
  const txType = watch('type');

  const load = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page) };
    if (filter.type) params.type = filter.type;
    if (filter.categoryId) params.categoryId = filter.categoryId;
    const res = await transactionAPI.getAll(params);
    setTransactions(res.data.transactions);
    setTotal(res.data.total);
    setPages(res.data.pages);
    setLoading(false);
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { categoryAPI.getAll().then(r => setCategories(r.data)); }, []);

  const openAdd = () => { setEditing(null); reset({ date: format(new Date(), 'yyyy-MM-dd'), type: 'EXPENSE' }); setShowModal(true); };
  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    reset({ amount: tx.amount, description: tx.description, type: tx.type, date: format(new Date(tx.date), 'yyyy-MM-dd'), categoryId: tx.categoryId });
    setShowModal(true);
  };
  const onSubmit = async (data: TxForm) => {
    const payload = { ...data, amount: Number(data.amount) };
    if (editing) await transactionAPI.update(editing.id, payload);
    else await transactionAPI.create(payload as any);
    setShowModal(false); load();
  };
  const onDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    await transactionAPI.delete(id); load();
  };

  const filteredCats = categories.filter(c => !txType || c.type === txType);

  return (
    <div style={{ padding: '40px' }}>
      {/* Header */}
      <div className="animate-fade-up stagger-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'Syne', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Transactions</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{total} records found</p>
        </div>
        <button onClick={openAdd} className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px' }}>
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card animate-fade-up stagger-2" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={16} color="var(--text-dim)" />
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value, categoryId: '' }))} className="input" style={{ flex: 1, padding: '8px 12px' }}>
          <option value="">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        <select value={filter.categoryId} onChange={e => setFilter(f => ({ ...f, categoryId: e.target.value }))} className="input" style={{ flex: 1, padding: '8px 12px' }}>
          <option value="">All Categories</option>
          {categories.filter(c => !filter.type || c.type === filter.type).map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        {(filter.type || filter.categoryId) && (
          <button onClick={() => setFilter({ type: '', categoryId: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', whiteSpace: 'nowrap' }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card animate-fade-up stagger-3" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No transactions found</p>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Description', 'Category', 'Date', 'Amount', ''].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease', animationDelay: `${0.04 * i}s` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: `${tx.category?.color}15`, flexShrink: 0 }}>
                          {tx.category?.icon}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#e2ede3' }}>{tx.description}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'var(--surface-3)', padding: '4px 10px', borderRadius: '20px' }}>{tx.category?.name}</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>{format(new Date(tx.date), 'MMM d, yyyy')}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {tx.type === 'INCOME' ? <ArrowUpRight size={14} color="#4ade80" /> : <ArrowDownRight size={14} color="#f87171" />}
                        <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'JetBrains Mono', color: tx.type === 'INCOME' ? '#4ade80' : '#f87171' }}>
                          {fmt(tx.amount)}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openEdit(tx)} style={{ padding: '7px', borderRadius: '9px', background: 'none', border: '1px solid transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', transition: 'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-4)'; (e.currentTarget as HTMLElement).style.color = '#e2ede3'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => onDelete(tx.id)} style={{ padding: '7px', borderRadius: '9px', background: 'none', border: '1px solid transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', transition: 'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {pages}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[['← Prev', page - 1, page === 1], ['Next →', page + 1, page === pages]].map(([label, p, disabled]) => (
                    <button key={label as string} onClick={() => setPage(p as number)} disabled={disabled as boolean}
                      style={{ padding: '7px 14px', borderRadius: '10px', background: 'var(--surface-3)', border: '1px solid var(--border)', color: disabled ? 'var(--text-dim)' : '#e2ede3', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '13px', transition: 'all 0.15s' }}>
                      {label as string}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <Modal title={`${editing ? 'Edit' : 'Add'} Transaction`} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Type toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {(['INCOME', 'EXPENSE'] as const).map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${txType === t ? (t === 'INCOME' ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)') : 'var(--border)'}`, background: txType === t ? (t === 'INCOME' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface-3)', color: txType === t ? (t === 'INCOME' ? '#4ade80' : '#f87171') : 'var(--text-muted)', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s' }}>
                  <input type="radio" value={t} {...register('type')} style={{ display: 'none' }} />
                  {t === 'INCOME' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />} {t}
                </label>
              ))}
            </div>

            {[
              { name: 'description', label: 'Description', type: 'text', placeholder: 'e.g. Grocery shopping' },
              { name: 'amount', label: 'Amount ($)', type: 'number', placeholder: '0.00' },
              { name: 'date', label: 'Date', type: 'date', placeholder: '' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>{f.label}</label>
                <input {...register(f.name as any, { required: true })} type={f.type} placeholder={f.placeholder} className="input" />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Category</label>
              <select {...register('categoryId', { required: true })} className="input">
                <option value="">Select category</option>
                {filteredCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editing ? 'Save Changes' : 'Add Transaction'}</button>
            </div>
          </form>
        </Modal>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}