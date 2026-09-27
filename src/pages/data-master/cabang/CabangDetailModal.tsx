import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import type { Cabang } from '../../../types/cabang';

interface CabangDetailModalProps {
  open: boolean;
  item: Cabang | null;
  onClose: () => void;
  /** Label dinamis: "Cabang" (Fotosnaps) atau "Event" (Burger Chill / Keripik Bujangan) */
  labelSingular?: string;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-surface-border last:border-0 gap-4">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <span className="text-xs font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}

export default function CabangDetailModal({
  open,
  item,
  onClose,
  labelSingular = 'Cabang',
}: CabangDetailModalProps) {
  if (!item) return null;

  const labelKode = labelSingular === 'Event' ? 'Kode Event' : 'Kode Cabang';
  const labelNama = labelSingular === 'Event' ? 'Nama Event' : 'Nama Cabang';

  return (
    <Modal
      title={`Detail ${labelSingular}`}
      open={open}
      onClose={onClose}
      footer={
        <button type="button" className="btn-secondary" onClick={onClose}>
          Tutup
        </button>
      }
    >
      <div>
        <Row label={labelKode} value={item.kodeCabang} />
        <Row label={labelNama} value={item.namaCabang} />
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
