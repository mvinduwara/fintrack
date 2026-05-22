import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { userAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import { User, Lock, CheckCircle, AlertCircle, Mail, Shield, Trash2 } from 'lucide-react';

interface ProfileForm { name: string; email: string; }
interface PasswordForm { currentPassword: string; newPassword: string; confirmPassword: string; }

const Toast = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
  <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', background: type === 'success' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${type === 'success' ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`, color: type === 'success' ? '#4ade80' : '#f87171', fontSize: '13px', marginBottom: '16px' }}>
    {type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
    {msg}
  </div>
);

export default function ProfilePage() {
  const { user, setAuth, token, logout } = useAuthStore();
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [passMsg, setPassMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: pe } } = useForm<ProfileForm>({
    defaultValues: { name: user?.name || '', email: user?.email || '' }
  });
  const { register: regPass, handleSubmit: handlePass, watch, reset: resetPass } = useForm<PasswordForm>();

  const showMsg = (setter: any, text: string, type: 'success' | 'error') => {
    setter({ text, type });
    setTimeout(() => setter(null), 4000);
  };

  const onProfile = async (data: ProfileForm) => {
    setProfileLoading(true);
    try {
      const res = await userAPI.update(data);
      setAuth(res.data, token!);
      showMsg(setProfileMsg, 'Profile updated successfully', 'success');
    } catch (err: any) {
      showMsg(setProfileMsg, err.response?.data?.message || 'Update failed', 'error');
    } finally { setProfileLoading(false); }
  };

  const onPassword = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      showMsg(setPassMsg, 'Passwords do not match', 'error'); return;
    }
    setPassLoading(true);
    try {
      await userAPI.update({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      showMsg(setPassMsg, 'Password updated successfully', 'success');
      resetPass();
    } catch (err: any) {
      showMsg(setPassMsg, err.response?.data?.message || 'Update failed', 'error');
    } finally { setPassLoading(false); }
  };

  const newPassword = watch('newPassword');

  return (
    <div style={{ padding: '40px', maxWidth: '720px' }}>
      {/* Header */}
      <div className="animate-fade-up stagger-1" style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'Syne', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Profile</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Manage your account settings</p>
      </div>

      {/* Avatar card */}
      <div className="card animate-fade-up stagger-1" style={{ padding: '28px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px', background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface-3) 100%)' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '22px', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontFamily: 'Syne', fontWeight: 700, color: '#000', flexShrink: 0, boxShadow: '0 8px 24px rgba(34,197,94,0.25)' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '20px', fontFamily: 'Syne', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{user?.name}</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={13} /> {user?.email}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
          <Shield size={13} color="#4ade80" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#4ade80' }}>Active</span>
        </div>
      </div>

      {/* Personal Info */}
      <div className="card animate-fade-up stagger-2" style={{ padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(74,222,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="#4ade80" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>Personal Info</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Update your name and email</p>
          </div>
        </div>

        {profileMsg && <Toast msg={profileMsg.text} type={profileMsg.type} />}

        <form onSubmit={handleProfile(onProfile)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Full Name</label>
              <input {...regProfile('name', { required: 'Name required' })} className="input" placeholder="John Doe" />
              {pe.name && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '5px' }}>{pe.name.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Email Address</label>
              <input {...regProfile('email', { required: 'Email required' })} type="email" className="input" placeholder="you@example.com" />
              {pe.email && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '5px' }}>{pe.email.message}</p>}
            </div>
          </div>
          <div>
            <button type="submit" disabled={profileLoading} className="btn-primary" style={{ width: 'auto', padding: '11px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="card animate-fade-up stagger-3" style={{ padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(251,146,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={16} color="#fb923c" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>Change Password</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ensure your account is secure</p>
          </div>
        </div>

        {passMsg && <Toast msg={passMsg.text} type={passMsg.type} />}

        <form onSubmit={handlePass(onPassword)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Current Password</label>
            <input {...regPass('currentPassword', { required: true })} type="password" placeholder="••••••••" className="input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>New Password</label>
              <input {...regPass('newPassword', { required: true, minLength: { value: 6, message: 'Min 6 characters' } })} type="password" placeholder="••••••••" className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Confirm New Password</label>
              <input {...regPass('confirmPassword', { required: true, validate: v => v === newPassword || 'Passwords must match' })} type="password" placeholder="••••••••" className="input" />
            </div>
          </div>

          {/* Password strength */}
          {newPassword && (
            <div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                {[1, 2, 3, 4].map(i => {
                  const strength = [newPassword.length >= 6, /[A-Z]/.test(newPassword), /[0-9]/.test(newPassword), /[^A-Za-z0-9]/.test(newPassword)].filter(Boolean).length;
                  const colors = ['#f87171', '#fb923c', '#fbbf24', '#4ade80'];
                  return <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength ? colors[strength - 1] : 'var(--surface-4)', transition: 'all 0.3s' }} />;
                })}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {[newPassword.length >= 6, /[A-Z]/.test(newPassword), /[0-9]/.test(newPassword), /[^A-Za-z0-9]/.test(newPassword)].filter(Boolean).length <= 1 ? 'Weak' :
                  [newPassword.length >= 6, /[A-Z]/.test(newPassword), /[0-9]/.test(newPassword), /[^A-Za-z0-9]/.test(newPassword)].filter(Boolean).length === 2 ? 'Fair' :
                  [newPassword.length >= 6, /[A-Z]/.test(newPassword), /[0-9]/.test(newPassword), /[^A-Za-z0-9]/.test(newPassword)].filter(Boolean).length === 3 ? 'Good' : 'Strong'} password
              </p>
            </div>
          )}

          <div>
            <button type="submit" disabled={passLoading} className="btn-primary" style={{ width: 'auto', padding: '11px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {passLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card animate-fade-up stagger-4" style={{ padding: '28px', border: '1px solid rgba(248,113,113,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={16} color="#f87171" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>Danger Zone</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Irreversible actions</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.1)' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#e2ede3', marginBottom: '3px' }}>Sign out of all devices</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Clear your session and sign out</p>
          </div>
          <button onClick={logout} style={{ padding: '9px 18px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.2)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}