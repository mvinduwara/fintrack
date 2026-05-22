import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import { TrendingUp, ArrowRight, User, Mail, Lock } from 'lucide-react';

interface RegisterForm { name: string; email: string; password: string; }

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true); setError('');
    try {
      const res = await authAPI.register(data);
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#080c0a', position: 'relative' }}>
      {/* Background glows */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div className="animate-fade-up stagger-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} color="#000" />
          </div>
          <span style={{ fontSize: '24px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>FinTrack</span>
        </div>

        <div className="card animate-fade-up stagger-2" style={{ padding: '40px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '26px', fontFamily: 'Syne', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Create your account</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Start your financial journey today</p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: User, rules: { required: 'Name required', minLength: { value: 2, message: 'Min 2 characters' } } },
              { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', icon: Mail, rules: { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } } },
              { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', icon: Lock, rules: { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } } },
            ].map(({ name, label, type, placeholder, icon: Icon, rules }) => (
              <div key={name}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }}>
                    <Icon size={15} />
                  </div>
                  <input {...register(name as any, rules)} type={type} placeholder={placeholder} className="input" style={{ paddingLeft: '42px' }} />
                </div>
                {errors[name as keyof typeof errors] && (
                  <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors[name as keyof typeof errors]?.message as string}</p>
                )}
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? 'Creating account...' : <> Get started free <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '24px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}