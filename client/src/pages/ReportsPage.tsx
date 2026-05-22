import { useEffect, useState } from 'react';
import { reportAPI } from '../api';
import { MonthlyReport, CategoryReport } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3 text-sm">
      <p className="text-white font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [monthly, setMonthly] = useState<MonthlyReport[]>([]);
  const [categories, setCategories] = useState<CategoryReport[]>([]);
  const [catType, setCatType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  useEffect(() => { reportAPI.getMonthly(year).then(r => setMonthly(r.data)); }, [year]);
  useEffect(() => { reportAPI.getCategories({ month, year, type: catType }).then(r => setCategories(r.data)); }, [month, year, catType]);

  const chartData = monthly.map(m => ({ name: MONTHS[m.month - 1], Income: m.income, Expense: m.expense, Net: m.net }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Reports</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Financial insights & analytics</p>
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-3 mb-8">
        {[year - 1, year, year + 1].map(y => (
          <button key={y} onClick={() => setYear(y)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${year === y ? 'text-black' : 'text-gray-400 hover:text-white'}`}
            style={year === y ? { background: 'var(--brand)' } : { background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            {y}
          </button>
        ))}
      </div>

      {/* Monthly Bar Chart */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-white mb-6">Monthly Overview — {year}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barGap={4}>
            <XAxis dataKey="name" tick={{ fill: '#6b8f6a', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b8f6a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold text-white">Category Breakdown</h2>
          <div className="flex items-center gap-2">
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-1.5 rounded-xl text-sm text-white outline-none" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {(['EXPENSE', 'INCOME'] as const).map(t => (
                <button key={t} onClick={() => setCatType(t)} className={`px-3 py-1.5 text-xs font-medium transition-all ${catType === t ? 'text-black' : 'text-gray-400'}`}
                  style={catType === t ? { background: 'var(--brand)' } : { background: 'var(--surface-3)' }}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        {categories.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No data for this period</p>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categories.map(c => ({ name: c.category?.name, value: c.amount }))}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                  {categories.map((c, i) => <Cell key={i} fill={c.category?.color || '#22c55e'} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 overflow-y-auto max-h-60">
              {categories.map((c, i) => {
                const total = categories.reduce((s, x) => s + x.amount, 0);
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--surface-3)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: c.category?.color }} />
                      <span className="text-sm text-white">{c.category?.icon} {c.category?.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold font-mono text-white">{fmt(c.amount)}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{((c.amount / total) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}