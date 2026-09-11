import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import type { PesananCabang } from '../../../types/pesananCabang';
import type { Produk } from '../../../types/produk';

interface PackingModalProps {
  open: boolean;
  pesanan: PesananCabang | null;
  produkList: Produk[];
  onClose: () => void;
  onSubmit: (packingResults: { soItemId: string; satuanKemasan: string; jumlahKemasan: number; sisaJumlah: number }[]) => Promise<void>;
}

export default function PackingModal({ open, pesanan, produkList, onClose, onSubmit }: PackingModalProps) {
  const [results, setResults] = useState<Record<string, { kemasan: string; jumlahK: number; sisa: number }>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (pesanan) {
      const init: Record<string, { kemasan: string; jumlahK: number; sisa: number }> = {};
      pesanan.items.forEach(it => {
        init[it.id] = { kemasan: it.satuan, jumlahK: it.jumlahDiambil || it.jumlahDipesan, sisa: 0 };
      });
      setResults(init);
    }
  }, [pesanan]);

  if (!pesanan) return null;

  const handleKalkulasi = (itemId: string, qtyAwal: number, kemasanTerpilih: string, produkId: string) => {
    const prd = produkList.find(p => p.id === produkId);
    const satuanBeliKode = prd?.satuanPembelian?.kode ?? prd?.satuanPembelian ?? '';
    const satuanDasarKode = prd?.satuan?.kode ?? prd?.satuan ?? '';
    let qty = qtyAwal;
    let sisa = 0;
    
    // Logika Konversi Sederhana:
    if (prd && kemasanTerpilih === satuanBeliKode && prd.konversi > 1) {
      const q = Math.floor(qtyAwal / prd.konversi);
      sisa = qtyAwal % prd.konversi;
      qty = q;
    } else if (prd && kemasanTerpilih === satuanDasarKode) {
      qty = qtyAwal;
      sisa = 0;
    }

    setResults(prev => ({
      ...prev,
      [itemId]: { kemasan: kemasanTerpilih, jumlahK: qty, sisa }
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = pesanan.items.map(it => ({
        soItemId: it.id,
        satuanKemasan: results[it.id]?.kemasan || it.satuan,
        jumlahKemasan: results[it.id]?.jumlahK || (it.jumlahDiambil || it.jumlahDipesan),
        sisaJumlah: results[it.id]?.sisa || 0,
      }));
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Packing Pesanan ${pesanan.nomorPesanan}`}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <p className="text-sm text-slate-600 mb-2">
          Masukkan hasil packing untuk dikirim ke <strong>{pesanan.cabangNama}</strong>. 
          Sistem akan mengkalkulasi jumlah kemasan otomatis berdasarkan konversi produk.
        </p>

        {pesanan.items.map((it) => {
          const produk = produkList.find(p => p.id === it.produkId);
          const qtyAwal = it.jumlahDiambil || it.jumlahDipesan;
          const currentRes = results[it.id] || { kemasan: it.satuan, jumlahK: qtyAwal, sisa: 0 };
          
          const sBeli = typeof produk?.satuanPembelian === 'string' ? produk.satuanPembelian : (produk?.satuanPembelian?.kode ?? '-');
          const sDasar = typeof produk?.satuan === 'string' ? produk.satuan : (produk?.satuan?.kode ?? '-');

          return (
            <div key={it.id} className="p-3 border border-surface-border rounded-lg bg-slate-50">
              <div className="flex justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-slate-800">{it.produkNama}</div>
                  <div className="text-xs text-slate-500">Jumlah diambil: {qtyAwal} {it.satuan}</div>
                </div>
                {produk && produk.konversi > 1 && (
                  <div className="text-xs text-blue-600 font-medium">
                    Info: 1 {sBeli} = {produk.konversi} {sDasar}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 items-end">
                <div className="col-span-1">
                  <label className="label">Kemasan</label>
                  <select 
                    className="input-field py-1.5 text-sm"
                    value={currentRes.kemasan}
                    onChange={(e) => handleKalkulasi(it.id, qtyAwal, e.target.value, it.produkId)}
                  >
                    {produk ? (
                      <>
                        <option value={sDasar}>{sDasar} (Dasar)</option>
                        {sBeli && sBeli !== sDasar && (
                          <option value={sBeli}>{sBeli} (Besar)</option>
                        )}
                      </>
                    ) : (
                      <option value={it.satuan}>{it.satuan}</option>
                    )}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="label">Hasil Packing</label>
                  <div className="input-field py-1.5 text-sm bg-slate-100 font-semibold text-slate-700">
                    {currentRes.jumlahK} {currentRes.kemasan}
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="label">Sisa</label>
                  <div className="input-field py-1.5 text-sm bg-slate-100 text-slate-600">
                    {currentRes.sisa} {it.satuan}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-surface-border">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
          Batal
        </button>
        <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Memproses...' : 'Simpan Hasil Packing'}
        </button>
      </div>
    </Modal>
  );
}
