import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { userAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import { User, Lock, CheckCircle } from 'lucide-react';

interface ProfileForm { name: string; email: string; }
interface PasswordForm { currentPassword: string; newPassword: string; confirmPassword: string; }

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const [profileMsg, setProfileMsg] = useState('');
  const [passMsg, setPassMsg] = useState('');

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: pe } } = useForm<ProfileForm>({
    defaultValues: { name: user?.name || '', email: user?.email || '' }
  });
  const { register: regPass, handleSubmit: handlePass, formState: { errors: pwe }, watch, reset: resetPass } = useForm<PasswordForm>();

  const onProfile = async (data: ProfileForm) => {
    try {
      const res = await userAPI.update(data);
      setAuth(res.data, token!);
      setProfileMsg('Profile updated!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      setProfileMsg(err.response?.data?.message || 'Update failed');
    }
  };

  const onPassword = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) { setPassMsg('Passwords do not match'); return; }
    try {
      await userAPI.update({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      setPassMsg('Password updated!');
      resetPass();
      setTimeout(() => setPassMsg(''), 3000);
    } catch (err: any) {
      setPassMsg(err.response?.data?.message || 'Update failed');
    }
  };

  const inputStyle = { background: 'var(--surface-3)', border: '1px solid var(--border)' };
  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all";

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your account settings</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-black" style={{ background: 'var(--brand)' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-display font-bold text-white">{user?.name}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card p-6 mb-4">
        <div className="flex items-center gap-2 mb-6">
          <User size={18} style={{ color: 'var(--brand)' }} />
          <h2 className="text-lg font-display font-bold text-white">Personal Info</h2>
        </div>
        {profileMsg && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm mb-4 ${profileMsg.includes('!') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {profileMsg.includes('!') && <CheckCircle size={14} />} {profileMsg}
          </div>
        )}
        <form onSubmit={handleProfile(onProfile)} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Full Name</label>
            <input {...regProfile('name', { required: 'Name required' })} className={inputClass} style={inputStyle} />
            {pe.name && <p className="text-red-400 text-xs mt-1">{pe.name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input {...regProfile('email', { required: 'Email required' })} type="email" className={inputClass} style={inputStyle} />
            {pe.email && <p className="text-red-400 text-xs mt-1">{pe.email.message}</p>}
          </div>
          <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black" style={{ background: 'var(--brand)' }}>Save Changes</button>
        </form>
      </div>

      {/* Password Form */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock size={18} style={{ color: 'var(--brand)' }} />
          <h2 className="text-lg font-display font-bold text-white">Change Password</h2>
        </div>
        {passMsg && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm mb-4 ${passMsg.includes('!') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {passMsg.includes('!') && <CheckCircle size={14} />} {passMsg}
          </div>
        )}
        <form onSubmit={handlePass(onPassword)} className="space-y-4">
          {[
            { name: 'currentPassword', label: 'Current Password' },
            { name: 'newPassword', label: 'New Password' },
            { name: 'confirmPassword', label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.name}>
              <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
              <input {...regPass(f.name as any, { required: `${f.label} required` })} type="password" placeholder="••••••••" className={inputClass} style={inputStyle} />
            </div>
          ))}
          <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black" style={{ background: 'var(--brand)' }}>Update Password</button>
        </form>
      </div>
    </div>
  );
}