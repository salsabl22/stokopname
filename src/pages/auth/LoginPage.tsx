import { useState } from 'react';
import { Shield, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { loginWithCredentials } from '../../services/authService';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginWithCredentials(username, password);
      login(response.token, response.user);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mx-auto mb-4 flex-wrap">
            <div className="w-28 rounded-lg bg-white/5 border border-white/10 shadow-lg p-1.5">
              <img src="/logos/fotosnaps.jpg" alt="Fotosnaps" className="w-full object-contain" />
            </div>
            <div className="w-28 rounded-lg bg-white/5 border border-white/10 shadow-lg p-1.5">
              <img src="/logos/burgerchill.jpg" alt="Burger Chill" className="w-full object-contain" />
            </div>
            <div className="w-28 rounded-lg bg-white/5 border border-white/10 shadow-lg p-1.5">
              <img src="/logos/keripik.jpg" alt="Keripik Bujangan" className="w-full object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Stok Opname Jawara</h1>
          <p className="text-slate-400 text-sm mt-1">Fotosnaps, Burger Chill &amp; Keripik Bujangan</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Masuk ke Akun</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 text-sm transition-colors mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Shield size={14} />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400">
              Belum punya akun?{' '}
              <Link
                to="/register"
                className="text-brand-400 hover:text-brand-300 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <UserPlus size={12} />
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Stok Opname Jawara v1.0 © 2026 — Fotosnaps, Burger Chill &amp; Keripik Bujangan
        </p>
      </div>
    </div>
  );
}
