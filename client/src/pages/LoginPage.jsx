import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, Lock, Mail, Shield, User, Smartphone, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('vinod@ridesense.ai');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'student') setEmail('vinod@ridesense.ai');
    if (newRole === 'driver') setEmail('driver03@ridesense.ai');
    if (newRole === 'admin') setEmail('admin@ridesense.ai');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password, role);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole) => {
    setError('');
    setLoading(true);
    try {
      const user = await quickDemoLogin(demoRole);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warmBg text-charcoal flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sageSoft/60 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full card-clean p-8 shadow-soft-lg relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emeraldPrimary flex items-center justify-center text-white mx-auto shadow-sm mb-3">
            <Bus className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-charcoal">Track My Bus Portal</h2>
          <p className="text-xs text-mutedGray mt-1">Sign in to access your live tracking dashboard</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-warmBg p-1.5 rounded-2xl border border-borderLight">
          {[
            { id: 'student', label: 'Student', icon: User },
            { id: 'driver', label: 'Driver', icon: Smartphone },
            { id: 'admin', label: 'Admin', icon: Shield }
          ].map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                onClick={() => handleRoleChange(r.id)}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  role === r.id
                    ? 'bg-emeraldPrimary text-white shadow-sm'
                    : 'text-mutedGray hover:text-charcoal'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {r.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-statusError/30 rounded-xl text-xs text-statusError flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charcoal block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-mutedGray absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-warmBg border border-borderLight pl-10 pr-4 py-3 rounded-xl text-xs text-charcoal outline-none focus:border-emeraldPrimary transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-mutedGray absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-warmBg border border-borderLight pl-10 pr-4 py-3 rounded-xl text-xs text-charcoal outline-none focus:border-emeraldPrimary transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emeraldPrimary hover:bg-emeraldDark text-white font-heading font-extrabold text-xs tracking-wider uppercase shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : `Sign In as ${role.toUpperCase()}`}
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="pt-4 border-t border-borderLight text-center">
          <span className="text-[11px] text-mutedGray font-bold uppercase tracking-wider block mb-2">
            ⚡ Quick Demo Access (1-Click Login)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickDemo('student')}
              className="w-1/3 py-2 bg-sageSoft hover:bg-emeraldPrimary hover:text-white border border-sageSoft text-emeraldDark rounded-xl text-xs font-bold transition"
            >
              Vinod Patil
            </button>
            <button
              onClick={() => handleQuickDemo('driver')}
              className="w-1/3 py-2 bg-sageSoft hover:bg-emeraldPrimary hover:text-white border border-sageSoft text-emeraldDark rounded-xl text-xs font-bold transition"
            >
              Driver Demo
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="w-1/3 py-2 bg-sageSoft hover:bg-emeraldPrimary hover:text-white border border-sageSoft text-emeraldDark rounded-xl text-xs font-bold transition"
            >
              Admin Demo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
