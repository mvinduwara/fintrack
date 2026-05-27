import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, TrendingUp, ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react';

interface LoginForm { email: string; password: string; }

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true); setError('');
    try {
      const res = await authAPI.login(data);
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#080c0a' }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0d1a10 0%, #080c0a 60%)',
        borderRight: '1px solid var(--border)'
      }} className="hidden lg:flex">
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Logo */}
        <div className="animate-fade-up stagger-1" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '64px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse-glow 3s ease infinite'
          }}>
            <TrendingUp size={22} color="#000" />
          </div>
          <span style={{ fontSize: '22px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>FinTrack</span>
        </div>

        {/* Hero text */}
        <div className="animate-fade-up stagger-2">
          <h1 style={{ fontSize: '48px', fontFamily: 'Syne', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px', color: '#fff' }}>
            Take control of<br />
            <span className="gradient-text">your finances</span>
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '380px' }}>
            Track spending, set budgets, and grow your wealth — all in one beautiful dashboard.
          </p>
        </div>

        {/* Feature pills */}
        <div className="animate-fade-up stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '48px' }}>
          {[
            { icon: Shield, label: 'Bank-level security' },
            { icon: Zap, label: 'Real-time tracking' },
            { icon: BarChart3, label: 'Smart analytics' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--brand-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Icon size={15} color="var(--brand)" />
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>


        <div className="animate-fade-up stagger-4" style={{ display: 'flex', gap: '32px', marginTop: '56px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
          {[['10k+', 'Users'], ['$2M+', 'Tracked'], ['99.9%', 'Uptime']].map(([val, label]) => (
            <div key={label}>
              <p style={{ fontSize: '22px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>{val}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px' }}>
        {/* Mobile logo */}
        <div className="lg:hidden animate-fade-up stagger-1" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={18} color="#000" />
          </div>
          <span style={{ fontSize: '20px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>FinTrack</span>
        </div>

        <div className="animate-fade-up stagger-1">
          <h2 style={{ fontSize: '30px', fontFamily: 'Syne', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Welcome back</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '36px' }}>Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="animate-fade-in" style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="animate-fade-up stagger-2" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Email address</label>
            <input
              {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
              type="email" placeholder="you@example.com" className="input"
            />
            {errors.email && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.email.message}</p>}
          </div>

          <div className="animate-fade-up stagger-3" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password', { required: 'Password is required' })}
                type={showPass ? 'text' : 'password'} placeholder="••••••••"
                className="input" style={{ paddingRight: '48px' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.password.message}</p>}
          </div>

          <div className="animate-fade-up stagger-4">
            <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </form>

        <p className="animate-fade-up stagger-5" style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '24px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Create one free →</Link>
        </p>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}