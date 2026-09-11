import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import type { SatuanBarang } from '../../../types/satuanBarang';

interface SatuanBarangDetailModalProps {
  open: boolean;
  item: SatuanBarang | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-800">{value}</span>
    </div>
  );
}

export default function SatuanBarangDetailModal({
  open,
  item,
  onClose,
}: SatuanBarangDetailModalProps) {
  if (!item) return null;

  return (
    <Modal
      title="Detail Satuan Barang"
      open={open}
      onClose={onClose}
      footer={
        <button type="button" className="btn-secondary" onClick={onClose}>
          Tutup
        </button>
      }
    >
      <div>
        <Row label="Kode Satuan" value={item.kodeSatuan} />
        <Row label="Nama Satuan" value={item.namaSatuan} />
        <Row label="Satuan Dasar" value={item.satuanDasar} />
        <Row
          label="Konversi"
          value={`1 ${item.kodeSatuan} = ${item.nilaiKonversi} ${item.satuanDasar}`}
        />
        <Row
          label="Status"
          value={
            <Badge tone={item.status === 'aktif' ? 'success' : 'neutral'}>
              {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
            </Badge>
          }
        />
        <Row label="Dibuat" value={new Date(item.createdAt).toLocaleString('id-ID')} />
        <Row label="Diperbarui" value={new Date(item.updatedAt).toLocaleString('id-ID')} />
      </div>
    </Modal>
  );
}
