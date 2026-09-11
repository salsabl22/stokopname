import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import type { Cabang } from '../../../types/cabang';

interface CabangDetailModalProps {
  open: boolean;
  item: Cabang | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-surface-border last:border-0 gap-4">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <span className="text-xs font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}

export default function CabangDetailModal({ open, item, onClose }: CabangDetailModalProps) {
  if (!item) return null;

  return (
    <Modal
      title="Detail Cabang"
      open={open}
      onClose={onClose}
      footer={
        <button type="button" className="btn-secondary" onClick={onClose}>
          Tutup
        </button>
      }
    >
      <div>
        <Row label="Kode Cabang" value={item.kodeCabang} />
        <Row label="Nama Cabang" value={item.namaCabang} />
        <Row label="Telepon" value={item.telepon} />
        <Row label="Alamat" value={item.alamat} />
        <Row
          label="Status"
          value={
            <Badge tone={item.status === 'aktif' ? 'success' : 'neutral'}>
              {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
            </Badge>
          }
        />
        <Row label="Dibuat" value={new Date(item.createdAt).toLocaleString('id-ID')} />
      </div>
    </Modal>
  );
}
