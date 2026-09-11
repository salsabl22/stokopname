import { ShieldX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <ShieldX size={36} className="text-red-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Ditolak</h1>
      <p className="text-slate-500 text-sm max-w-sm mb-6">
        Anda tidak memiliki izin untuk mengakses halaman ini.
        Hubungi administrator untuk mendapatkan akses.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate(-1)}
        >
          Kembali
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/')}
        >
          Ke Dasbor
        </button>
      </div>
    </div>
  );
}
