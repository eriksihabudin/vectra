import { Resident } from "@/types/resident";

/**
 * Urutan 11 Kolom Baku sesuai PRD Vectra:
 * 1. NIK
 * 2. NO KK
 * 3. NO HP
 * 4. NAMA LENGKAP
 * 5. JENIS KELAMIN
 * 6. AGAMA
 * 7. PEKERJAAN
 * 8. RT
 * 9. RW
 * 10. UNSUR PEMILIH
 * 11. KATEGORI
 */
export const EXCEL_COLUMNS = [
  { header: "NIK", key: "nik" },
  { header: "NO KK", key: "noKk" },
  { header: "NO HP", key: "noHp" },
  { header: "NAMA LENGKAP", key: "namaLengkap" },
  { header: "JENIS KELAMIN", key: "jenisKelamin" },
  { header: "AGAMA", key: "agama" },
  { header: "PEKERJAAN", key: "pekerjaan" },
  { header: "RT", key: "rt" },
  { header: "RW", key: "rw" },
  { header: "UNSUR PEMILIH", key: "unsurPemilih" },
  { header: "KATEGORI", key: "kategori" },
] as const;

export function exportResidentsToCsv(
  data: Resident[],
  filename = "data_kependudukan_vectra.csv"
) {
  const headers = EXCEL_COLUMNS.map((col) => col.header);

  const rows = data.map((res) => [
    `\t${res.nik}`, // Tambahkan tab agar Excel memperlakukan NIK sebagai teks eksplisit
    `\t${res.noKk}`, // NO KK sebagai teks eksplisit
    `\t${res.noHp}`,
    `"${res.namaLengkap.replace(/"/g, '""')}"`,
    `"${res.jenisKelamin}"`,
    `"${res.agama}"`,
    `"${res.pekerjaan.replace(/"/g, '""')}"`,
    `\t${res.rt}`,
    `\t${res.rw}`,
    `"${res.unsurPemilih}"`,
    `"${res.kategori}"`,
  ]);

  // Tambahkan UTF-8 BOM (\uFEFF) agar Microsoft Excel otomatis membaca UTF-8 dengan benar
  const csvContent =
    "\uFEFF" +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
