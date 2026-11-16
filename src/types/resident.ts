export type Gender = "LAKI-LAKI" | "PEREMPUAN";

export type Religion =
  | "ISLAM"
  | "KRISTEN"
  | "KATOLIK"
  | "HINDU"
  | "BUDDHA"
  | "KONGHUCU"
  | "LAINNYA";

export type UnsurPemilih =
  | "PEMILIH TETAP (DPT)"
  | "PEMILIH PEMULA"
  | "LANSIA"
  | "DISABILITAS"
  | "TOKOH MASYARAKAT"
  | "TNI/POLRI PURNAWIRAWAN"
  | "PENDATANG";

export type Kategori =
  | "PRIORITAS 1"
  | "PRIORITAS 2"
  | "BINAAN"
  | "UMUM"
  | "POTENSIAL";

export interface Resident {
  id: string;
  // 11 Atribut Baku Terurut Sesuai PRD
  nik: string;
  noKk: string;
  noHp: string;
  namaLengkap: string;
  jenisKelamin: Gender;
  agama: Religion;
  pekerjaan: string;
  rt: string;
  rw: string;
  unsurPemilih: UnsurPemilih;
  kategori: Kategori;

  // Metadata & Audit
  fotoKtpPath?: string;
  ocrRawText?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResidentFilters {
  search: string;
  jenisKelamin: string;
  agama: string;
  rt: string;
  rw: string;
  unsurPemilih: string;
  kategori: string;
}

export type ResidentFormData = Omit<Resident, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};
