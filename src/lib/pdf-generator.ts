import { jsPDF } from 'jspdf';

interface PengajuanData {
  id: string;
  detailKerusakan: string;
  tanggalRencana: string;
  tanggalPengajuan: string;
  ttdPemohon: string | null;
  ttdKasubag: string | null;
  nomorSurat?: string | null;
  user: {
    namaLengkap: string;
    nip: string | null;
    unitKerja: string | null;
  };
  kasubag: {
    namaLengkap: string;
  } | null;
  kendaraan: {
    platNomor: string;
    merkModel: string;
    tahunPembelian: number | null;
  };
}

export function generateSuratPengajuan(data: PengajuanData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  
  const blackColor: [number, number, number] = [0, 0, 0];
  
  // =================== HEADER (KOP SURAT) ===================
  let y = 10;
  
  // Header text - hitam, center aligned
  doc.setTextColor(...blackColor);
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.text('PEMERINTAH KOTA BALIKPAPAN', pageWidth / 2, y, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text('DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK', pageWidth / 2, y + 5, { align: 'center' });
  doc.text('DAN KELUARGA BERENCANA', pageWidth / 2, y + 10, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('(DP3AKB)', pageWidth / 2, y + 16, { align: 'center' });
  
  // Garis pembatas
  doc.setLineWidth(0.5);
  doc.line(margin, y + 20, pageWidth - margin, y + 20);
  
  doc.setFontSize(8);
  doc.setFont('times', 'normal');
  doc.text('Jl. MT HARYONO Rt.26 NOMOR 186 KELURAHAN SUNGAINANGKA,', pageWidth / 2, y + 24, { align: 'center' });
  doc.text('KECAMATAN BALIKPAPAN SELATAN, KOTA BALIKPAPAN', pageWidth / 2, y + 28, { align: 'center' });
  
  // Kontak
  doc.text('Telp. : (0542) 424808, 8810561  fax : (0542) 424808, 8810562', pageWidth / 2, y + 33, { align: 'center' });
  doc.text('Email : dpppakkotabalikpapan@yahoo.com  Kode Pos : 76114', pageWidth / 2, y + 37, { align: 'center' });
  
  // Garis pembatas bawah
  doc.line(margin, y + 40, pageWidth - margin, y + 40);
  
  // =================== DATE & RECIPIENT ===================
  y = 55;
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  
  // Date - right side
  const dateStr = formatDate(data.tanggalPengajuan);
  doc.text(`Balikpapan, ${dateStr}`, pageWidth - margin, y, { align: 'right' });
  y += 8;
  
  // Recipient - left side
  doc.text('Kepada', margin, y);
  y += 5;
  doc.text('Yth.', margin, y);
  doc.text('Pimpinan Bengkel', margin + 15, y);
  y += 5;
  doc.text('di-', margin + 15, y);
  y += 5;
  doc.text('      Balikpapan', margin + 15, y);
  y += 12;
  
  // =================== TITLE ===================
  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  const title = 'SURAT PENGANTAR';
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  
  // Underline
  doc.setLineWidth(0.5);
  doc.line((pageWidth - titleWidth) / 2, y + 1.5, (pageWidth + titleWidth) / 2, y + 1.5);
  
  y += 8;
  
  // =================== LETTER NUMBER ===================
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  const nomorSurat = data.nomorSurat || `${String(new Date().getDate()).padStart(2, '0')}/${String(new Date().getMonth() + 1).padStart(2, '0')}/DP3AKB-SKT`;
  doc.text(`Nomor : ${nomorSurat}`, pageWidth / 2, y, { align: 'center' });
  
  y += 12;
  
  // =================== TABLE ===================
  // Table dimensions
  const tableX = margin;
  const tableWidth = pageWidth - 2 * margin;
  const colWidths = [25, 25, 40, 35, 55]; // OPD, Jenis, Merk, No Polisi, Keterangan
  const headerHeight = 8;
  const lineHeight = 5;
  
  // Calculate keterangan height based on content
  const keteranganText = data.detailKerusakan || '-';
  const keteranganLines = doc.splitTextToSize(keteranganText, colWidths[4] - 6);
  const keteranganHeight = Math.max(headerHeight, keteranganLines.length * lineHeight + 4);
  
  // Draw table header row
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  
  let currentX = tableX;
  
  // Header cells
  const drawHeaderCell = (x: number, width: number, height: number, text: string) => {
    doc.rect(x, y, width, height);
    doc.setFontSize(9);
    doc.setFont('times', 'bold');
    doc.text(text, x + width / 2, y + height / 2 + 1, { align: 'center', baseline: 'middle' });
  };
  
  drawHeaderCell(currentX, colWidths[0], headerHeight, 'OPD');
  currentX += colWidths[0];
  drawHeaderCell(currentX, colWidths[1], headerHeight, 'Jenis');
  currentX += colWidths[1];
  drawHeaderCell(currentX, colWidths[2], headerHeight, 'Merk/Type');
  currentX += colWidths[2];
  drawHeaderCell(currentX, colWidths[3], headerHeight, 'No. Polisi');
  currentX += colWidths[3];
  drawHeaderCell(currentX, colWidths[4], headerHeight, 'Keterangan');
  
  y += headerHeight;
  
  // Data row
  currentX = tableX;
  
  const drawDataCell = (x: number, width: number, height: number, text: string, align: 'center' | 'left' = 'center', isMultiline = false) => {
    doc.rect(x, y, width, height);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    
    if (isMultiline && Array.isArray(text)) {
      // Multi-line text (for keterangan)
      let textY = y + 4;
      text.forEach((line: string) => {
        doc.text(line, x + 3, textY, { align: 'left' });
        textY += lineHeight;
      });
    } else {
      const lines = doc.splitTextToSize(text, width - 6);
      if (lines.length === 1) {
        doc.text(text, x + width / 2, y + height / 2 + 1, { align: align, baseline: 'middle' });
      } else {
        let textY = y + 4;
        lines.forEach((line: string) => {
          doc.text(line, x + 3, textY, { align: 'left' });
          textY += lineHeight;
        });
      }
    }
  };
  
  drawDataCell(currentX, colWidths[0], keteranganHeight, 'DP3AKB');
  currentX += colWidths[0];
  drawDataCell(currentX, colWidths[1], keteranganHeight, 'Roda 2');
  currentX += colWidths[1];
  
  // Merk/Type
  const merkText = data.kendaraan.merkModel || '-';
  doc.rect(currentX, y, colWidths[2], keteranganHeight);
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  const merkLines = doc.splitTextToSize(merkText, colWidths[2] - 6);
  let textY = y + keteranganHeight / 2 - (merkLines.length * lineHeight) / 2 + 4;
  merkLines.forEach((line: string) => {
    doc.text(line, currentX + colWidths[2] / 2, textY, { align: 'center' });
    textY += lineHeight;
  });
  currentX += colWidths[2];
  
  drawDataCell(currentX, colWidths[3], keteranganHeight, data.kendaraan.platNomor);
  currentX += colWidths[3];
  
  // Keterangan - multi-line
  doc.rect(currentX, y, colWidths[4], keteranganHeight);
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  let ketY = y + 4;
  keteranganLines.forEach((line: string) => {
    doc.text(line, currentX + 3, ketY, { align: 'left' });
    ketY += lineHeight;
  });
  
  y += keteranganHeight + 20;
  
  // =================== SIGNATURE SECTION ===================
  const sigWidth = 75;
  const leftSigX = margin + 5;
  const rightSigX = pageWidth - margin - sigWidth - 5;
  
  // Label jabatan di atas tanda tangan
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.text('PENGGUNA KENDARAAN', leftSigX + sigWidth / 2, y, { align: 'center' });
  doc.text('KASUBAG UMUM', rightSigX + sigWidth / 2, y, { align: 'center' });
  
  y += 15;
  
  // Tanda tangan digital (nama terang) - di tengah
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  
  // TTD Pemohon - centered
  if (data.ttdPemohon) {
    const ttdPemohonUpper = data.ttdPemohon.toUpperCase();
    const ttdPemohonWidth = doc.getTextWidth(ttdPemohonUpper);
    doc.text(ttdPemohonUpper, leftSigX + (sigWidth - ttdPemohonWidth) / 2, y);
  }
  
  // TTD Kasubag - centered
  if (data.ttdKasubag) {
    const ttdKasubagUpper = data.ttdKasubag.toUpperCase();
    const ttdKasubagWidth = doc.getTextWidth(ttdKasubagUpper);
    doc.text(ttdKasubagUpper, rightSigX + (sigWidth - ttdKasubagWidth) / 2, y);
  }
  
  y += 12;
  
  // Nama di bawah tanda tangan
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  
  // Nama Pemohon - centered
  const namaPemohon = data.user.namaLengkap;
  const namaPemohonWidth = doc.getTextWidth(namaPemohon);
  doc.text(namaPemohon, leftSigX + (sigWidth - namaPemohonWidth) / 2, y);
  
  // Nama Kasubag - centered
  const namaKasubag = data.kasubag?.namaLengkap || '-';
  const namaKasubagWidth = doc.getTextWidth(namaKasubag);
  doc.text(namaKasubag, rightSigX + (sigWidth - namaKasubagWidth) / 2, y);
  
  // =================== NOTES BOX ===================
  y += 15;
  
  // Draw notes box
  const notesStartY = y;
  const notesPadding = 5;
  
  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  
  const notes = [
    '1. Diharapkan untuk melakukan pemeliharaan dengan maximum budget Rp 1.000.000 / Tahun (Harga Belum',
    '    Termasuk pajak 11%).',
    '2. Tidak diperkenankan melakukan Penggantian Aksesoris Kendaraan karena bukan tanggungan dari',
    '    DP3AKB selain Sparepart dan Jasa. Jika diketahui user mengganti Aksesoris maka akan ditanggung',
    '    sendiri oleh pengguna Kendaraan.',
    '3. Tidak diperkenankan untuk melakukan pemeliharaan melebihi budget yg tertera pada No. 1, jika',
    '    melebihi budget maka akan ditanggung oleh pengguna Kendaraan.',
    '4. Diharapkan Pengguna Kendaraan mengambil foto pada saat dilakukannya pemeliharaan kendaraan.'
  ];
  
  // Calculate box height
  const noteLineHeight = 4;
  const notesHeight = notes.length * noteLineHeight + notesPadding * 2 + 6;
  
  // Draw box
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(margin, notesStartY, tableWidth, notesHeight);
  
  // Note title
  doc.text('Note :', margin + notesPadding, notesStartY + notesPadding + 4);
  
  // Note content
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  
  let noteY = notesStartY + notesPadding + 10;
  notes.forEach(note => {
    doc.text(note, margin + notesPadding, noteY);
    noteY += noteLineHeight;
  });
  
  // =================== FOOTER ===================
  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
  doc.text('Dokumen ini dihasilkan secara elektronik melalui Sistem Pengajuan Service Kendaraan DP3AKB Kota Balikpapan', pageWidth / 2, 285, { align: 'center' });
  
  // Save
  const filename = `Surat_Pengantar_Service_${data.kendaraan.platNomor.replace(/\s/g, '_')}_${formatDateFile(data.tanggalPengajuan)}.pdf`;
  doc.save(filename);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('id-ID', options);
}

function formatDateFile(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
