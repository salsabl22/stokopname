/**
 * Export Utilities untuk WMS Stock Opname
 * Mendukung export ke Excel (xlsx) dan PDF (jsPDF + autotable)
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

function formatExportDate(): string {
  return new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Export data ke file Excel (.xlsx)
 */
export function exportToExcel(
  data: Record<string, any>[],
  columns: ExportColumn[],
  options: {
    filename: string;
    sheetName?: string;
    title?: string;
    unitBisnis?: string;
  },
): void {
  const { filename, sheetName = 'Data', title = 'Laporan WMS', unitBisnis } = options;

  const wb = XLSX.utils.book_new();

  const headerRows: any[][] = [
    [`${title}${unitBisnis ? ` — ${unitBisnis}` : ''}`],
    [`Tanggal Export: ${formatExportDate()}`],
    ['WMS Stock Opname — Fotosnaps & Keripik Bujangan'],
    [],
    columns.map(c => c.header),
    ...data.map(row =>
      columns.map(c => {
        const val = row[c.key];
        if (val === null || val === undefined) return '';
        if (val instanceof Date) return val.toLocaleDateString('id-ID');
        return String(val);
      }),
    ),
  ];

  const ws = XLSX.utils.aoa_to_sheet(headerRows);
  ws['!cols'] = columns.map(c => ({ wch: c.width || 20 }));
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: columns.length - 1 } },
  ];

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export data ke file PDF (A4, auto landscape untuk banyak kolom)
 */
export function exportToPdf(
  data: Record<string, any>[],
  columns: ExportColumn[],
  options: {
    filename: string;
    title?: string;
    unitBisnis?: string;
    orientation?: 'portrait' | 'landscape';
  },
): void {
  const {
    filename,
    title = 'Laporan WMS',
    unitBisnis,
    orientation = columns.length > 6 ? 'landscape' : 'portrait',
  } = options;

  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${title}${unitBisnis ? ` — ${unitBisnis}` : ''}`, pageWidth / 2, 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Tanggal Export: ${formatExportDate()}`, pageWidth / 2, 21, { align: 'center' });
  doc.text('WMS Stock Opname — Fotosnaps & Keripik Bujangan', pageWidth / 2, 26, { align: 'center' });

  autoTable(doc, {
    head: [columns.map(c => c.header)],
    body: data.map(row =>
      columns.map(c => {
        const val = row[c.key];
        if (val === null || val === undefined) return '';
        if (val instanceof Date) return val.toLocaleDateString('id-ID');
        return String(val);
      }),
    ),
    startY: 32,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 10, right: 10 },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.1,
  });

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' },
    );
  }

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function formatTanggalID(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
}

export function formatAngka(val: number | null | undefined): string {
  if (val === null || val === undefined) return '0';
  return val.toLocaleString('id-ID');
}
