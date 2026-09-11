import { useState } from 'react';
import { Package2, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { registerUser } from '../../services/authService';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', name: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.username.trim() || !form.name.trim() || !form.password) {
      setError('Semua kolom wajib diisi.');
      return;
    }
    if (form.username.length < 3) {
      setError('Username minimal 3 karakter.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        username: form.username.trim(),
        name: form.name.trim(),
        password: form.password,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Pendaftaran Berhasil!</h1>
          <p className="text-slate-400 text-sm mb-6">
            Akun <span className="text-white font-medium">@{form.username}</span> sudah terdaftar.{' '}
            Akun Anda sedang menunggu persetujuan dari admin. Silakan hubungi admin untuk mempercepat proses.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg px-6 py-2.5 text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
            <Package2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Stok Opname Jawara</h1>
          <p className="text-slate-400 text-sm mt-1">Daftar Akun Baru</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Buat Akun</h2>
          <p className="text-xs text-slate-400 mb-6">
            Setelah mendaftar, akun Anda perlu disetujui oleh admin terlebih dahulu.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Budi Santoso"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input
                type="text"
                name="username"
                required
                autoComplete="username"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                value={form.username}
                onChange={handleChange}
                placeholder="Minimal 3 karakter, tanpa spasi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  autoComplete="new-password"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
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

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Konfirmasi Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                autoComplete="new-password"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 text-sm transition-colors mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400">
              Sudah punya akun?{' '}
              <Link
                to="/"
                className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Stok Opname Jawara v1.0 © 2026
        </p>
      </div>
    </div>
  );
}
