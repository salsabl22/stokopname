
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.11.0
 * Query Engine version: efd2449663b3d73d637ea1fd226bafbcf45b3102
 */
Prisma.prismaVersion = {
  client: "5.11.0",
  engine: "efd2449663b3d73d637ea1fd226bafbcf45b3102"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  roleId: 'roleId',
  modul: 'modul',
  lihat: 'lihat',
  buat: 'buat',
  ubah: 'ubah',
  hapus: 'hapus',
  proses: 'proses',
  setujui: 'setujui',
  export: 'export'
};

exports.Prisma.UserPermissionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  modul: 'modul',
  lihat: 'lihat',
  buat: 'buat',
  ubah: 'ubah',
  hapus: 'hapus',
  proses: 'proses',
  setujui: 'setujui',
  export: 'export'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  name: 'name',
  password: 'password',
  roleId: 'roleId',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SatuanBarangScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  nama: 'nama',
  deskripsi: 'deskripsi',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KonversiSatuanScalarFieldEnum = {
  id: 'id',
  produkId: 'produkId',
  satuanBesarId: 'satuanBesarId',
  satuanKecilId: 'satuanKecilId',
  nilaiKonversi: 'nilaiKonversi',
  createdAt: 'createdAt'
};

exports.Prisma.ProdukScalarFieldEnum = {
  id: 'id',
  kodeProduk: 'kodeProduk',
  namaProduk: 'namaProduk',
  kategori: 'kategori',
  unitBisnis: 'unitBisnis',
  satuanId: 'satuanId',
  satuanPembelianId: 'satuanPembelianId',
  konversi: 'konversi',
  minimumStok: 'minimumStok',
  trackBatch: 'trackBatch',
  status: 'status',
  deskripsi: 'deskripsi',
  hargaBeli: 'hargaBeli',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BatchScalarFieldEnum = {
  id: 'id',
  nomorBatch: 'nomorBatch',
  produkId: 'produkId',
  tanggalProduksi: 'tanggalProduksi',
  tanggalKedaluwarsa: 'tanggalKedaluwarsa',
  jumlahAwal: 'jumlahAwal',
  jumlahSisa: 'jumlahSisa',
  status: 'status',
  referensiPO: 'referensiPO',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PemasokScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  nama: 'nama',
  kontak: 'kontak',
  telepon: 'telepon',
  email: 'email',
  alamat: 'alamat',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CabangScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  nama: 'nama',
  tipe: 'tipe',
  telepon: 'telepon',
  alamat: 'alamat',
  pic: 'pic',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GudangScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  nama: 'nama',
  alamat: 'alamat',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RakScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  gudangId: 'gudangId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LokasiScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  tipe: 'tipe',
  rakId: 'rakId',
  kapasitas: 'kapasitas',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PurchaseOrderScalarFieldEnum = {
  id: 'id',
  nomorPO: 'nomorPO',
  tanggal: 'tanggal',
  tanggalTargetKedatangan: 'tanggalTargetKedatangan',
  pemasokId: 'pemasokId',
  totalPesanan: 'totalPesanan',
  status: 'status',
  barangSesuai: 'barangSesuai',
  jumlahSesuai: 'jumlahSesuai',
  catatanSelisih: 'catatanSelisih',
  hasilQC: 'hasilQC',
  perluRepack: 'perluRepack',
  catatanQC: 'catatanQC',
  lokasiPenyimpanan: 'lokasiPenyimpanan',
  nomorPenerimaan: 'nomorPenerimaan',
  nomorQC: 'nomorQC',
  nomorPutaway: 'nomorPutaway',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.POItemScalarFieldEnum = {
  id: 'id',
  poId: 'poId',
  produkId: 'produkId',
  satuan: 'satuan',
  jumlahPesan: 'jumlahPesan',
  jumlahDiterima: 'jumlahDiterima',
  hargaSatuan: 'hargaSatuan',
  batchId: 'batchId',
  tanggalProduksi: 'tanggalProduksi',
  tanggalKedaluwarsa: 'tanggalKedaluwarsa',
  createdAt: 'createdAt'
};

exports.Prisma.InventoryScalarFieldEnum = {
  id: 'id',
  produkId: 'produkId',
  lokasiId: 'lokasiId',
  batchId: 'batchId',
  jumlahTersedia: 'jumlahTersedia',
  jumlahDialokasikan: 'jumlahDialokasikan',
  jumlahKarantina: 'jumlahKarantina',
  jumlahWaste: 'jumlahWaste',
  minimumStok: 'minimumStok',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalesOrderScalarFieldEnum = {
  id: 'id',
  nomorSO: 'nomorSO',
  tanggal: 'tanggal',
  deadline: 'deadline',
  cabangId: 'cabangId',
  status: 'status',
  prioritas: 'prioritas',
  catatan: 'catatan',
  nomorPicking: 'nomorPicking',
  nomorPacking: 'nomorPacking',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SOItemScalarFieldEnum = {
  id: 'id',
  soId: 'soId',
  produkId: 'produkId',
  satuan: 'satuan',
  jumlahPesan: 'jumlahPesan',
  jumlahAlokasi: 'jumlahAlokasi',
  jumlahPick: 'jumlahPick',
  createdAt: 'createdAt'
};

exports.Prisma.PackingResultScalarFieldEnum = {
  id: 'id',
  soItemId: 'soItemId',
  produkId: 'produkId',
  nomorPacking: 'nomorPacking',
  jumlahAwal: 'jumlahAwal',
  satuanAwal: 'satuanAwal',
  satuanKemasan: 'satuanKemasan',
  jumlahKemasan: 'jumlahKemasan',
  satuanSisa: 'satuanSisa',
  sisaJumlah: 'sisaJumlah',
  petugasId: 'petugasId',
  waktuMulai: 'waktuMulai',
  waktuSelesai: 'waktuSelesai',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.StockMovementScalarFieldEnum = {
  id: 'id',
  produkId: 'produkId',
  tipe: 'tipe',
  jumlah: 'jumlah',
  keterangan: 'keterangan',
  referensi: 'referensi',
  nomorDokumen: 'nomorDokumen',
  lokasiAsal: 'lokasiAsal',
  lokasiTujuan: 'lokasiTujuan',
  batchId: 'batchId',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.ShipmentScalarFieldEnum = {
  id: 'id',
  nomorSJ: 'nomorSJ',
  soId: 'soId',
  metodePengiriman: 'metodePengiriman',
  tanggalPengiriman: 'tanggalPengiriman',
  estimasiTiba: 'estimasiTiba',
  tanggalAktualTiba: 'tanggalAktualTiba',
  keteranganPengiriman: 'keteranganPengiriman',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReturScalarFieldEnum = {
  id: 'id',
  nomorRetur: 'nomorRetur',
  soId: 'soId',
  cabangId: 'cabangId',
  poId: 'poId',
  alasan: 'alasan',
  status: 'status',
  kondisi: 'kondisi',
  catatan: 'catatan',
  tanggalPengajuan: 'tanggalPengajuan',
  tanggalPersetujuan: 'tanggalPersetujuan',
  tanggalPenerimaan: 'tanggalPenerimaan',
  tanggalPemeriksaan: 'tanggalPemeriksaan',
  tanggalKeputusan: 'tanggalKeputusan',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FotoReturScalarFieldEnum = {
  id: 'id',
  returId: 'returId',
  filePath: 'filePath',
  fileName: 'fileName',
  mimeType: 'mimeType',
  ukuranBytes: 'ukuranBytes',
  keterangan: 'keterangan',
  timestamp: 'timestamp',
  uploadedBy: 'uploadedBy',
  createdAt: 'createdAt'
};

exports.Prisma.ReturItemScalarFieldEnum = {
  id: 'id',
  returId: 'returId',
  produkId: 'produkId',
  satuan: 'satuan',
  jumlah: 'jumlah',
  batchId: 'batchId',
  kondisi: 'kondisi',
  createdAt: 'createdAt'
};

exports.Prisma.CycleCountScalarFieldEnum = {
  id: 'id',
  nomorCC: 'nomorCC',
  tanggal: 'tanggal',
  gudangId: 'gudangId',
  petugasId: 'petugasId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CycleCountItemScalarFieldEnum = {
  id: 'id',
  cycleCountId: 'cycleCountId',
  produkId: 'produkId',
  lokasiId: 'lokasiId',
  satuan: 'satuan',
  stokSistem: 'stokSistem',
  stokFisik: 'stokFisik',
  selisih: 'selisih',
  alasan: 'alasan',
  createdAt: 'createdAt'
};

exports.Prisma.StockAdjustmentScalarFieldEnum = {
  id: 'id',
  nomorADJ: 'nomorADJ',
  produkId: 'produkId',
  lokasiId: 'lokasiId',
  jumlahLama: 'jumlahLama',
  jumlahBaru: 'jumlahBaru',
  selisih: 'selisih',
  alasan: 'alasan',
  status: 'status',
  pengajuId: 'pengajuId',
  penyetujuId: 'penyetujuId',
  tanggalSetuju: 'tanggalSetuju',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ExceptionLogScalarFieldEnum = {
  id: 'id',
  nomorEXC: 'nomorEXC',
  tipe: 'tipe',
  referensi: 'referensi',
  pemasokId: 'pemasokId',
  produkId: 'produkId',
  keterangan: 'keterangan',
  alasanPengembalian: 'alasanPengembalian',
  status: 'status',
  resolvedBy: 'resolvedBy',
  resolvedAt: 'resolvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FotoPengembalianPemasokScalarFieldEnum = {
  id: 'id',
  exceptionLogId: 'exceptionLogId',
  filePath: 'filePath',
  fileName: 'fileName',
  mimeType: 'mimeType',
  ukuranBytes: 'ukuranBytes',
  keterangan: 'keterangan',
  timestamp: 'timestamp',
  uploadedBy: 'uploadedBy',
  createdAt: 'createdAt'
};

exports.Prisma.WasteScalarFieldEnum = {
  id: 'id',
  nomorWaste: 'nomorWaste',
  produkId: 'produkId',
  batchId: 'batchId',
  lokasiId: 'lokasiId',
  jumlah: 'jumlah',
  satuan: 'satuan',
  alasan: 'alasan',
  referensi: 'referensi',
  petugasId: 'petugasId',
  approval: 'approval',
  createdAt: 'createdAt'
};

exports.Prisma.TaskScalarFieldEnum = {
  id: 'id',
  nomorTugas: 'nomorTugas',
  jenis: 'jenis',
  referensiId: 'referensiId',
  deskripsi: 'deskripsi',
  prioritas: 'prioritas',
  assignedTo: 'assignedTo',
  status: 'status',
  deadline: 'deadline',
  waktuMulai: 'waktuMulai',
  waktuSelesai: 'waktuSelesai',
  catatan: 'catatan',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  judul: 'judul',
  pesan: 'pesan',
  tipe: 'tipe',
  referensiId: 'referensiId',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.ActivityLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  aksi: 'aksi',
  modul: 'modul',
  referensiId: 'referensiId',
  nomorDokumen: 'nomorDokumen',
  detail: 'detail',
  dataSebelum: 'dataSebelum',
  dataSesudah: 'dataSesudah',
  ipAddress: 'ipAddress',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Role: 'Role',
  Permission: 'Permission',
  UserPermission: 'UserPermission',
  User: 'User',
  SatuanBarang: 'SatuanBarang',
  KonversiSatuan: 'KonversiSatuan',
  Produk: 'Produk',
  Batch: 'Batch',
  Pemasok: 'Pemasok',
  Cabang: 'Cabang',
  Gudang: 'Gudang',
  Rak: 'Rak',
  Lokasi: 'Lokasi',
  PurchaseOrder: 'PurchaseOrder',
  POItem: 'POItem',
  Inventory: 'Inventory',
  SalesOrder: 'SalesOrder',
  SOItem: 'SOItem',
  PackingResult: 'PackingResult',
  StockMovement: 'StockMovement',
  Shipment: 'Shipment',
  Retur: 'Retur',
  FotoRetur: 'FotoRetur',
  ReturItem: 'ReturItem',
  CycleCount: 'CycleCount',
  CycleCountItem: 'CycleCountItem',
  StockAdjustment: 'StockAdjustment',
  ExceptionLog: 'ExceptionLog',
  FotoPengembalianPemasok: 'FotoPengembalianPemasok',
  Waste: 'Waste',
  Task: 'Task',
  Notification: 'Notification',
  ActivityLog: 'ActivityLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
