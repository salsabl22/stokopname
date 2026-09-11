import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import type { PesananPembelian } from '../../../types/barangMasuk';
import type { Gudang, Rak } from '../../../types/gudang';
import { fetchGudang, fetchRakByGudang, fetchLokasiByRak } from '../../../services/gudangService';
import type { LokasiPenyimpanan } from '../../../types/gudang';

interface PenyimpananFormModalProps {
  open: boolean;
  po: PesananPembelian | null;
  onClose: () => void;
  onSubmit: (lokasiLabel: string) => Promise<void>;
}

export default function PenyimpananFormModal({ open, po, onClose, onSubmit }: PenyimpananFormModalProps) {
  const [gudangList, setGudangList] = useState<Gudang[]>([]);
  const [rakList, setRakList] = useState<Rak[]>([]);
  const [lokasiList, setLokasiList] = useState<LokasiPenyimpanan[]>([]);

  const [gudangId, setGudangId] = useState('');
  const [rakId, setRakId] = useState('');
  const [lokasiId, setLokasiId] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setGudangId('');
    setRakId('');
    setLokasiId('');
    setError(null);
    fetchGudang().then(setGudangList);
  }, [open]);

  useEffect(() => {
    if (!gudangId) {
      setRakList([]);
      return;
    }
    fetchRakByGudang(gudangId).then(setRakList);
    setRakId('');
    setLokasiId('');
  }, [gudangId]);

  useEffect(() => {
    if (!rakId) {
      setLokasiList([]);
      return;
    }
    fetchLokasiByRak(rakId).then(setLokasiList);
    setLokasiId('');
  }, [rakId]);

  if (!po) return null;

  async function handleSubmit() {
    if (!lokasiId) {
      setError('Pilih lokasi penyimpanan lengkap (Gudang, Rak, Lokasi).');
      return;
    }
    setError(null);
    const gudang = gudangList.find((g) => g.id === gudangId);
    const rak = rakList.find((r) => r.id === rakId);
    const lokasi = lokasiList.find((l) => l.id === lokasiId);
    const label = `${gudang?.namaGudang} / ${rak?.namaRak} / ${lokasi?.namaLokasi}`;

    setSubmitting(true);
    try {
      await onSubmit(label);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={`Penyimpanan — ${po.nomorPO}`}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan ke Gudang'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        {error && (
          <div className="text-xs text-status-danger bg-status-dangerBg rounded-md px-3 py-2">{error}</div>
        )}

        <div>
          <label className="label-field">Gudang</label>
          <select className="input-field" value={gudangId} onChange={(e) => setGudangId(e.target.value)} disabled={submitting}>
            <option value="">Pilih gudang</option>
            {gudangList.map((g) => (
              <option key={g.id} value={g.id}>
                {g.kodeGudang} — {g.namaGudang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-field">Rak</label>
          <select
            className="input-field"
            value={rakId}
            onChange={(e) => setRakId(e.target.value)}
            disabled={submitting || !gudangId}
          >
            <option value="">Pilih rak</option>
            {rakList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.kodeRak} — {r.namaRak}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-field">Lokasi Penyimpanan</label>
          <select
            className="input-field"
            value={lokasiId}
            onChange={(e) => setLokasiId(e.target.value)}
            disabled={submitting || !rakId}
          >
            <option value="">Pilih lokasi</option>
            {lokasiList.map((l) => (
              <option key={l.id} value={l.id}>
                {l.kodeLokasi} — {l.namaLokasi}
              </option>
            ))}
          </select>
          {rakId && lokasiList.length === 0 && (
            <p className="text-[11px] text-status-warning bg-status-warningBg rounded-md px-3 py-2 mt-1.5">
              Belum ada lokasi di rak ini. Tambahkan dulu di Data Master &gt; Gudang & Lokasi.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
