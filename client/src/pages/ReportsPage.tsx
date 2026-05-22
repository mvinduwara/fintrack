import { useEffect, useState } from 'react';
import { reportAPI } from '../api';
import { MonthlyReport, CategoryReport } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtFull = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <p style={{ fontSize: '13px', fontWeight: 600, color: '#e2ede3', marginBottom: '8px' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.name}:</p>
          <p style={{ fontSize: '12px', fontWeight: 600, color: p.color, fontFamily: 'JetBrains Mono' }}>{fmt(p.value)}</p>
        </div>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [monthly, setMonthly] = useState<MonthlyReport[]>([]);
  const [categories, setCategories] = useState<CategoryReport[]>([]);
  const [catType, setCatType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportAPI.getMonthly(year).then(r => { setMonthly(r.data); setLoading(false); });
  }, [year]);

  useEffect(() => {
    reportAPI.getCategories({ month, year, type: catType }).then(r => setCategories(r.data));
  }, [month, year, catType]);

  const chartData = monthly.map(m => ({
    name: MONTHS[m.month - 1], Income: m.income, Expense: m.expense, Net: m.net
  }));

  const totalIncome = monthly.reduce((s, m) => s + m.income, 0);
  const totalExpense = monthly.reduce((s, m) => s + m.expense, 0);
  const totalNet = totalIncome - totalExpense;
  const catTotal = categories.reduce((s, c) => s + c.amount, 0);

  const bestMonth = monthly.reduce((best, m) => m.net > (best?.net || -Infinity) ? m : best, monthly[0]);
  const worstMonth = monthly.reduce((worst, m) => m.net < (worst?.net || Infinity) ? m : worst, monthly[0]);

  return (
    <div style={{ padding: '40px' }}>
      {/* Header */}
      <div className="animate-fade-up stagger-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'Syne', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Reports</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Financial insights & analytics</p>
        </div>
        {/* Year selector */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[year - 1, year, year + 1].map(y => (
            <button key={y} onClick={() => setYear(y)} style={{ padding: '8px 16px', borderRadius: '10px', border: `1px solid ${year === y ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`, background: year === y ? 'var(--brand-glow)' : 'var(--surface-2)', color: year === y ? 'var(--brand-light)' : 'var(--text-muted)', fontSize: '13px', fontWeight: year === y ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Annual summary cards */}
      <div className="animate-fade-up stagger-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: `${year} Total Income`, value: totalIncome, color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.15)', Icon: TrendingUp },
          { label: `${year} Total Expense`, value: totalExpense, color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)', Icon: TrendingDown },
          { label: `${year} Net Savings`, value: totalNet, color: totalNet >= 0 ? '#fb923c' : '#f87171', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.15)', Icon: totalNet >= 0 ? TrendingUp : TrendingDown },
        ].map(({ label, value, color, bg, border, Icon }) => (
          <div key={label} className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
              </div>
            </div>
            <p style={{ fontSize: '24px', fontFamily: 'Syne', fontWeight: 700, color }}>{fmt(value)}</p>
          </div>
        ))}
      </div>

      {/* Best / Worst month */}
      {monthly.length > 0 && (
        <div className="animate-fade-up stagger-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Best Month', data: bestMonth, color: '#4ade80', bg: 'rgba(74,222,128,0.06)', Icon: TrendingUp },
            { label: 'Worst Month', data: worstMonth, color: '#f87171', bg: 'rgba(248,113,113,0.06)', Icon: TrendingDown },
          ].map(({ label, data, color, bg, Icon }) => data && (
            <div key={label} className="card" style={{ padding: '20px 24px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={color} />
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '3px' }}>{label}</p>
                  <p style={{ fontSize: '16px', fontFamily: 'Syne', fontWeight: 700, color: '#e2ede3' }}>{MONTHS[data.month - 1]} {year}</p>
                </div>
              </div>
              <p style={{ fontSize: '18px', fontFamily: 'JetBrains Mono', fontWeight: 600, color }}>{fmt(data.net)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Monthly Bar Chart */}
      <div className="card animate-fade-up stagger-3" style={{ padding: '28px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '17px', fontFamily: 'Syne', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>Monthly Overview — {year}</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barGap={3} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? `${v / 1000}k` : v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="Income" fill="#22c55e" radius={[5, 5, 0, 0]} />
              <Bar dataKey="Expense" fill="#f87171" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Net Line Chart */}
      <div className="card animate-fade-up stagger-3" style={{ padding: '28px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '17px', fontFamily: 'Syne', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>Net Savings Trend — {year}</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? `${v / 1000}k` : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Net" stroke="#fb923c" strokeWidth={2.5} dot={{ fill: '#fb923c', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="card animate-fade-up stagger-4" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '17px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>Category Breakdown</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input" style={{ padding: '8px 12px', width: 'auto' }}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m} {year}</option>)}
            </select>
            <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {(['EXPENSE', 'INCOME'] as const).map(t => (
                <button key={t} onClick={() => setCatType(t)} style={{ padding: '8px 16px', background: catType === t ? 'var(--brand-glow)' : 'var(--surface-3)', color: catType === t ? 'var(--brand-light)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: catType === t ? 600 : 400, transition: 'all 0.15s' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Minus size={24} color="var(--text-dim)" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No data for this period</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px', alignItems: 'start' }}>
            {/* Pie chart */}
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categories.map(c => ({ name: c.category?.name, value: c.amount }))}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={55} paddingAngle={2}>
                  {categories.map((c, i) => <Cell key={i} fill={c.category?.color || '#22c55e'} strokeWidth={0} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmtFull(v)} contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.map((c, i) => {
                const pct = ((c.amount / catTotal) * 100).toFixed(1);
                return (
                  <div key={i} className="animate-fade-up" style={{ animationDelay: `${0.04 * i}s`, opacity: 0, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: 'var(--surface-3)', transition: 'all 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-4)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: `${c.category?.color}18`, flexShrink: 0 }}>
                      {c.category?.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#e2ede3' }}>{c.category?.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pct}%</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'JetBrains Mono', color: '#e2ede3' }}>{fmtFull(c.amount)}</span>
                        </div>
                      </div>
                      <div style={{ height: '4px', borderRadius: '99px', background: 'var(--surface-4)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '99px', width: `${pct}%`, background: c.category?.color || 'var(--brand)', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}