import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import type { Produk } from '../../../types/produk';

interface ProdukDetailModalProps {
  open: boolean;
  item: Produk | null;
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

export default function ProdukDetailModal({ open, item, onClose }: ProdukDetailModalProps) {
  if (!item) return null;

  return (
    <Modal
      title="Detail Produk"
      open={open}
      onClose={onClose}
      footer={
        <button type="button" className="btn-secondary" onClick={onClose}>
          Tutup
        </button>
      }
    >
      <div>
        <Row label="Kode Produk" value={item.kodeProduk} />
        <Row label="Nama Produk" value={item.namaProduk} />
        <Row label="Kategori" value={item.kategori} />
        <Row label="Unit Bisnis" value={item.unitBisnis === 'FOTOSNAPS' ? '📸 Fotosnaps' : '🥨 Keripik Bujangan'} />
        <Row label="Konversi (Pengali)" value={item.konversi} />
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
