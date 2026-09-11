import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import type { PesananPembelian } from '../../../types/barangMasuk';
import { formatRupiah } from '../../../utils/statusPO';
import { useMasterStatus } from '../../../hooks/useMasterStatus';

interface PesananPembelianDetailModalProps {
  open: boolean;
  item: PesananPembelian | null;
  onClose: () => void;
}

export default function PesananPembelianDetailModal({
  open,
  item,
  onClose,
}: PesananPembelianDetailModalProps) {
  const { getLabel, getTone } = useMasterStatus('PO');

  if (!item) return null;

  return (
    <Modal
      title={`Detail ${item.nomorPO}`}
      open={open}
      onClose={onClose}
      footer={
        <button type="button" className="btn-secondary" onClick={onClose}>
          Tutup
        </button>
      }
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{item.nomorPO}</h2>
            <p className="text-sm text-slate-500">{item.pemasokNama}</p>
          </div>
          <Badge tone={getTone(item.status)}>{getLabel(item.status)}</Badge>
        </div>

        <div className="border-t border-surface-border pt-2">
          <p className="text-[11px] font-semibold uppercase text-slate-400 mb-1.5">Item Pesanan</p>
          <div className="space-y-1.5">
            {item.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {it.produkNama} ({it.jumlahPesan} {it.satuan})
                  {it.jumlahDiterima !== undefined && it.jumlahDiterima !== it.jumlahPesan && (
                    <span className="text-status-danger"> — diterima {it.jumlahDiterima}</span>
                  )}
                </span>
                <span className="text-slate-700 font-medium">
                  {formatRupiah(it.jumlahPesan * it.hargaSatuan)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-surface-border pt-2">
          <span className="text-xs font-medium text-slate-600">Total</span>
          <span className="text-sm font-semibold text-slate-800">{formatRupiah(item.totalPesanan)}</span>
        </div>

        {item.catatanSelisih && (
          <p className="text-[11px] text-status-warning bg-status-warningBg rounded-md px-3 py-2">
            Selisih: {item.catatanSelisih}
          </p>
        )}
        {item.hasilQC && (
          <p className="text-[11px] text-slate-500">
            Hasil QC: <span className="font-medium capitalize">{item.hasilQC}</span>
            {item.catatanQC ? ` — ${item.catatanQC}` : ''}
          </p>
        )}
        {item.lokasiPenyimpanan && (
          <p className="text-[11px] text-slate-500">Disimpan di: {item.lokasiPenyimpanan}</p>
        )}
      </div>
    </Modal>
  );
}
