import { Construction } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Construction size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">Halaman ini belum tersedia</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        Modul ini akan diimplementasikan pada tahap berikutnya sesuai rencana pengembangan.
      </p>
    </div>
  );
}
