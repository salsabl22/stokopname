import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import type { Pemasok } from '../../../types/pemasok';

interface PemasokDetailModalProps {
  open: boolean;
  item: Pemasok | null;
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

export default function PemasokDetailModal({ open, item, onClose }: PemasokDetailModalProps) {
  if (!item) return null;

  return (
    <Modal
      title="Detail Supplier"
      open={open}
      onClose={onClose}
      footer={
        <button type="button" className="btn-secondary" onClick={onClose}>
          Tutup
        </button>
      }
    >
      <div>
        <Row label="Kode Supplier" value={item.kodePemasok} />
        <Row label="Nama Supplier" value={item.namaPemasok} />
        <Row label="Kontak" value={item.kontak} />
        <Row label="Email" value={item.email || '-'} />
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
