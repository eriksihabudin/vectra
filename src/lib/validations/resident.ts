import { z } from "zod";

export const genderEnum = z.enum(["LAKI-LAKI", "PEREMPUAN"]);

export const religionEnum = z.enum([
  "ISLAM",
  "KRISTEN",
  "KATOLIK",
  "HINDU",
  "BUDDHA",
  "KONGHUCU",
  "LAINNYA",
]);

export const unsurPemilihEnum = z.enum([
  "PEMILIH TETAP (DPT)",
  "PEMILIH PEMULA",
  "LANSIA",
  "DISABILITAS",
  "TOKOH MASYARAKAT",
  "TNI/POLRI PURNAWIRAWAN",
  "PENDATANG",
]);

export const kategoriEnum = z.enum([
  "PRIORITAS 1",
  "PRIORITAS 2",
  "BINAAN",
  "UMUM",
  "POTENSIAL",
]);

// 11 Kolom Baku Validator
export const residentSchema = z.object({
  nik: z
    .string()
    .length(16, "NIK harus terdiri dari 16 digit")
    .regex(/^[0-9]+$/, "NIK hanya boleh berisi angka"),
  noKk: z
    .string()
    .length(16, "Nomor KK harus terdiri dari 16 digit")
    .regex(/^[0-9]+$/, "Nomor KK hanya boleh berisi angka"),
  noHp: z
    .string()
    .min(8, "Nomor HP minimal 8 karakter")
    .max(20, "Nomor HP maksimal 20 karakter"),
  namaLengkap: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(255, "Nama lengkap maksimal 255 karakter")
    .transform((val) => val.trim().toUpperCase()),
  jenisKelamin: genderEnum,
  agama: z.string().min(1, "Agama wajib diisi").transform((val) => val.trim().toUpperCase()),
  pekerjaan: z
    .string()
    .min(1, "Pekerjaan wajib diisi")
    .max(100)
    .transform((val) => val.trim().toUpperCase()),
  rt: z
    .string()
    .min(1)
    .max(5)
    .transform((val) => val.trim().padStart(3, "0")),
  rw: z
    .string()
    .min(1)
    .max(5)
    .transform((val) => val.trim().padStart(3, "0")),
  unsurPemilih: z.string().min(1, "Unsur pemilih wajib diisi"),
  kategori: z.string().min(1, "Kategori wajib diisi"),

  // Optional audit / bot metadata
  fotoKtpPath: z.string().optional().nullable(),
  ocrRawText: z.string().optional().nullable(),
  createdByUserId: z.string().optional().nullable(),
  telegramChatId: z.string().optional().nullable(),
  telegramSenderName: z.string().optional().nullable(),
});

export const residentUpdateSchema = residentSchema.partial();

export type ResidentInput = z.infer<typeof residentSchema>;
export type ResidentUpdateInput = z.infer<typeof residentUpdateSchema>;
