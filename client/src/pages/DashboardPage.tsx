import { useEffect, useState } from 'react';
import { reportAPI } from '../api';
import { DashboardStats, Transaction } from '../types';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportAPI.getDashboard().then(r => { setStats(r.data); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const cards = [
    { label: 'Total Balance', value: stats?.totalBalance || 0, icon: Wallet, color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.15)', change: '+12.5%' },
    { label: 'Monthly Income', value: stats?.monthlyIncome || 0, icon: TrendingUp, color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.15)', change: '+8.2%' },
    { label: 'Monthly Expense', value: stats?.monthlyExpense || 0, icon: TrendingDown, color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)', change: '-3.1%' },
    { label: 'Monthly Savings', value: stats?.monthlySavings || 0, icon: PiggyBank, color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.15)', change: '+5.4%' },
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1200px' }}>
     
      <div className="animate-fade-up stagger-1" style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'Syne', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Summary Cards */}
      <div className="animate-fade-up stagger-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {cards.map(({ label, value, icon: Icon, color, bg, border, change }) => (
          <div key={label} className="card card-hover" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color, background: bg, padding: '3px 8px', borderRadius: '20px' }}>{change}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 }}>{label}</p>
            <p style={{ fontSize: '22px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>{fmt(value)}</p>
          </div>
        ))}
      </div>

     
      <div className="card animate-fade-up stagger-3" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '17px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>Recent Transactions</h2>
          <Link to="/transactions" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {!stats?.recentTransactions?.length ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Wallet size={22} color="var(--text-dim)" />
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No transactions yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {stats.recentTransactions.map((tx: Transaction, i: number) => (
              <div key={tx.id} className="animate-fade-up" style={{ animationDelay: `${0.05 * i}s`, opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '14px', background: 'var(--surface-3)', transition: 'all 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-4)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: `${tx.category?.color}15`, flexShrink: 0 }}>
                    {tx.category?.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#e2ede3', marginBottom: '2px' }}>{tx.description}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tx.category?.name} · {format(new Date(tx.date), 'MMM d')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {tx.type === 'INCOME'
                    ? <ArrowUpRight size={15} color="#4ade80" />
                    : <ArrowDownRight size={15} color="#f87171" />}
                  <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'JetBrains Mono', color: tx.type === 'INCOME' ? '#4ade80' : '#f87171' }}>
                    {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}