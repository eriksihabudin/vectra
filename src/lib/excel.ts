import ExcelJS from "exceljs";
import { Resident } from "@/lib/db/schema";

export const EXCEL_COLUMNS = [
  { header: "NIK", key: "nik", width: 22 },
  { header: "NO KK", key: "noKk", width: 22 },
  { header: "NO HP", key: "noHp", width: 18 },
  { header: "NAMA LENGKAP", key: "namaLengkap", width: 30 },
  { header: "JENIS KELAMIN", key: "jenisKelamin", width: 16 },
  { header: "AGAMA", key: "agama", width: 15 },
  { header: "PEKERJAAN", key: "pekerjaan", width: 25 },
  { header: "RT", key: "rt", width: 8 },
  { header: "RW", key: "rw", width: 8 },
  { header: "UNSUR PEMILIH", key: "unsurPemilih", width: 24 },
  { header: "KATEGORI", key: "kategori", width: 20 },
] as const;

export interface ExcelRowData {
  nik: string;
  noKk: string;
  noHp: string;
  namaLengkap: string;
  jenisKelamin: string;
  agama: string;
  pekerjaan: string;
  rt: string;
  rw: string;
  unsurPemilih: string;
  kategori: string;
}

/**
 * Generate binary buffer (.xlsx) for Vectra resident data with 11 standard columns,
 * Navy #1E3A8A header styling, freeze panes, text formatting for ID numbers, and cell borders.
 */
export async function generateResidentsExcel(
  data: (Resident | ExcelRowData)[],
  sheetTitle = "Data Kependudukan"
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Vectra Kependudukan System";
  workbook.lastModifiedBy = "Vectra Kependudukan System";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet(sheetTitle, {
    views: [{ state: "frozen", ySplit: 1 }],
    properties: { defaultRowHeight: 22 },
  });

  // Setup columns
  worksheet.columns = EXCEL_COLUMNS.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
  }));

  // Style Header Row (Row 1)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 30;
  headerRow.font = {
    name: "Calibri",
    size: 11,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  headerRow.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A8A" }, // Navy #1E3A8A
    };
    cell.border = {
      top: { style: "medium", color: { argb: "FF0F172A" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "medium", color: { argb: "FF0F172A" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });

  // Populate Data Rows
  data.forEach((item, index) => {
    const row = worksheet.addRow({
      nik: item.nik || "",
      noKk: item.noKk || "",
      noHp: item.noHp || "",
      namaLengkap: item.namaLengkap || "",
      jenisKelamin: item.jenisKelamin || "",
      agama: item.agama || "",
      pekerjaan: item.pekerjaan || "",
      rt: item.rt || "",
      rw: item.rw || "",
      unsurPemilih: item.unsurPemilih || "",
      kategori: item.kategori || "",
    });

    row.height = 22;

    const isEven = index % 2 === 0;
    const bgArgb = isEven ? "FFFFFFFF" : "FFF8FAFC"; // alternating row zebra

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      // Background fill
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: bgArgb },
      };

      // Border styling
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      cell.font = {
        name: "Calibri",
        size: 10,
        color: { argb: "FF1E293B" },
      };

      // Explicit string format '@' for ID numbers and codes to prevent scientific notation
      // Col 1: NIK, Col 2: NO KK, Col 3: NO HP, Col 8: RT, Col 9: RW
      if ([1, 2, 3, 8, 9].includes(colNumber)) {
        cell.numFmt = "@";
        // Force text value
        cell.value = String(cell.value || "");
      }

      // Alignment
      if ([1, 2, 3, 5, 8, 9].includes(colNumber)) {
        // Center alignment for NIK, NO KK, NO HP, JK, RT, RW
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }
    });
  });

  // Write to Buffer
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
