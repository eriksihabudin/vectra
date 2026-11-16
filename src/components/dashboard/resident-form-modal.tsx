"use client";

import React, { useState, useEffect } from "react";
import { Resident, ResidentFormData, Religion, UnsurPemilih, Kategori } from "@/types/resident";
import {
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  UNSUR_PEMILIH_OPTIONS,
  KATEGORI_OPTIONS,
  RT_OPTIONS,
  RW_OPTIONS,
  OCCUPATION_OPTIONS,
} from "@/data/mock-residents";
import { Button } from "@/components/ui/button";
import {
  X,
  Save,
  UserPlus,
  Edit,
  AlertCircle,
  FileCheck2,
} from "lucide-react";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ResidentFormData) => void;
  initialData?: Resident | null;
  existingResidents: Resident[];
}

export function ResidentFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingResidents,
}: FormModalProps) {
  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState<ResidentFormData>({
    nik: "",
    noKk: "",
    noHp: "",
    namaLengkap: "",
    jenisKelamin: "LAKI-LAKI",
    agama: "ISLAM",
    pekerjaan: "KARYAWAN SWASTA",
    rt: "001",
    rw: "001",
    unsurPemilih: "PEMILIH TETAP (DPT)",
    kategori: "PRIORITAS 1",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        nik: initialData.nik,
        noKk: initialData.noKk,
        noHp: initialData.noHp,
        namaLengkap: initialData.namaLengkap,
        jenisKelamin: initialData.jenisKelamin,
        agama: initialData.agama,
        pekerjaan: initialData.pekerjaan,
        rt: initialData.rt,
        rw: initialData.rw,
        unsurPemilih: initialData.unsurPemilih,
        kategori: initialData.kategori,
        fotoKtpPath: initialData.fotoKtpPath,
        createdBy: initialData.createdBy,
      });
      setErrors({});
    } else {
      setFormData({
        nik: "",
        noKk: "",
        noHp: "",
        namaLengkap: "",
        jenisKelamin: "LAKI-LAKI",
        agama: "ISLAM",
        pekerjaan: "KARYAWAN SWASTA",
        rt: "001",
        rw: "001",
        unsurPemilih: "PEMILIH TETAP (DPT)",
        kategori: "PRIORITAS 1",
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. NIK: Tepat 16 digit numerik
    if (!formData.nik.trim()) {
      newErrors.nik = "NIK wajib diisi.";
    } else if (!/^\d{16}$/.test(formData.nik.trim())) {
      newErrors.nik = "NIK harus tepat 16 digit angka.";
    } else {
      // Cek duplikasi NIK
      const isDuplicate = existingResidents.some(
        (r) => r.nik === formData.nik.trim() && r.id !== initialData?.id
      );
      if (isDuplicate) {
        newErrors.nik = "NIK ini sudah terdaftar di sistem (duplikasi dicegah).";
      }
    }

    // 2. NO KK: Tepat 16 digit numerik
    if (!formData.noKk.trim()) {
      newErrors.noKk = "Nomor Kartu Keluarga wajib diisi.";
    } else if (!/^\d{16}$/.test(formData.noKk.trim())) {
      newErrors.noKk = "Nomor KK harus tepat 16 digit angka.";
    }

    // 3. NO HP: 10-14 digit numerik, diawali 08 atau +628
    const cleanedHp = formData.noHp.trim().replace(/\s+/g, "");
    if (!cleanedHp) {
      newErrors.noHp = "Nomor HP aktif wajib diisi.";
    } else if (!/^(08|\+628)\d{8,12}$/.test(cleanedHp)) {
      newErrors.noHp = "Format HP tidak valid (contoh: 08123456789 atau +628123456789).";
    }

    // 4. NAMA LENGKAP: Min 3 karakter
    if (!formData.namaLengkap.trim()) {
      newErrors.namaLengkap = "Nama lengkap wajib diisi sesuai KTP.";
    } else if (formData.namaLengkap.trim().length < 3) {
      newErrors.namaLengkap = "Nama lengkap minimal 3 karakter.";
    }

    // 7. PEKERJAAN
    if (!formData.pekerjaan.trim()) {
      newErrors.pekerjaan = "Pekerjaan wajib diisi.";
    }

    // 8 & 9. RT & RW
    if (!formData.rt.trim()) {
      newErrors.rt = "RT wajib diisi.";
    }
    if (!formData.rw.trim()) {
      newErrors.rw = "RW wajib diisi.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      // Normalisasi RT dan RW menjadi 3 digit (misal: 1 -> 001)
      const normalizedRt = formData.rt.padStart(3, "0");
      const normalizedRw = formData.rw.padStart(3, "0");

      onSave({
        ...formData,
        namaLengkap: formData.namaLengkap.trim().toUpperCase(),
        nik: formData.nik.trim(),
        noKk: formData.noKk.trim(),
        noHp: formData.noHp.trim(),
        rt: normalizedRt,
        rw: normalizedRw,
      });
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150">
      <div
        className="bg-card text-card-foreground border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              {isEditMode ? <Edit className="size-4" /> : <UserPlus className="size-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground font-heading">
                {isEditMode ? "Perbarui Data Penduduk" : "Entri Data Penduduk Baru"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Lengkapi 11 Atribut Baku Kependudukan sesuai standar PRD Vectra
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {/* Section: Identitas Wajib (NIK, KK, HP) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-wider uppercase">
              <FileCheck2 className="size-4" />
              <span>1. Identitas Pokok & Kontak</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 1: NIK */}
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center justify-between mb-1">
                  <span>1. NIK (16 Digit) *</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formData.nik.length}/16
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.nik}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, nik: val });
                    if (errors.nik) setErrors({ ...errors, nik: "" });
                  }}
                  placeholder="3201xxxxxxxxxxxx"
                  className={`w-full h-9 px-3 text-sm font-mono rounded-lg border bg-background text-foreground focus:outline-none transition-all ${
                    errors.nik
                      ? "border-destructive ring-1 ring-destructive/40"
                      : "border-input focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  }`}
                />
                {errors.nik && (
                  <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    <span>{errors.nik}</span>
                  </p>
                )}
              </div>

              {/* Field 2: NO KK */}
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center justify-between mb-1">
                  <span>2. NO KK (16 Digit) *</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formData.noKk.length}/16
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.noKk}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, noKk: val });
                    if (errors.noKk) setErrors({ ...errors, noKk: "" });
                  }}
                  placeholder="3201xxxxxxxxxxxx"
                  className={`w-full h-9 px-3 text-sm font-mono rounded-lg border bg-background text-foreground focus:outline-none transition-all ${
                    errors.noKk
                      ? "border-destructive ring-1 ring-destructive/40"
                      : "border-input focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  }`}
                />
                {errors.noKk && (
                  <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    <span>{errors.noKk}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Field 3: NO HP */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                3. NO HP / WhatsApp *
              </label>
              <input
                type="text"
                value={formData.noHp}
                onChange={(e) => {
                  setFormData({ ...formData, noHp: e.target.value });
                  if (errors.noHp) setErrors({ ...errors, noHp: "" });
                }}
                placeholder="Contoh: 081234567890 atau +6281234567890"
                className={`w-full h-9 px-3 text-sm font-mono rounded-lg border bg-background text-foreground focus:outline-none transition-all ${
                  errors.noHp
                    ? "border-destructive ring-1 ring-destructive/40"
                    : "border-input focus:ring-2 focus:ring-primary/20 focus:border-primary"
                }`}
              />
              {errors.noHp && (
                <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{errors.noHp}</span>
                </p>
              )}
            </div>
          </div>

          {/* Section: Profil Pribadi & Demografi */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-wider uppercase">
              <span>2. Profil Kependudukan</span>
            </div>

            {/* Field 4: NAMA LENGKAP */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                4. NAMA LENGKAP (Sesuai KTP) *
              </label>
              <input
                type="text"
                value={formData.namaLengkap}
                onChange={(e) => {
                  setFormData({ ...formData, namaLengkap: e.target.value });
                  if (errors.namaLengkap) setErrors({ ...errors, namaLengkap: "" });
                }}
                placeholder="NAMA LENGKAP DALAM HURUF KAPITAL"
                className={`w-full h-9 px-3 text-sm font-medium rounded-lg border bg-background text-foreground focus:outline-none uppercase transition-all ${
                  errors.namaLengkap
                    ? "border-destructive ring-1 ring-destructive/40"
                    : "border-input focus:ring-2 focus:ring-primary/20 focus:border-primary"
                }`}
              />
              {errors.namaLengkap && (
                <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{errors.namaLengkap}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 5: JENIS KELAMIN */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  5. JENIS KELAMIN *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GENDER_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, jenisKelamin: g })}
                      className={`h-9 text-xs font-medium rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        formData.jenisKelamin === g
                          ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                          : "border-input bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {g === "LAKI-LAKI" ? "Laki-Laki" : "Perempuan"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 6: AGAMA */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  6. AGAMA *
                </label>
                <select
                  value={formData.agama}
                  onChange={(e) =>
                    setFormData({ ...formData, agama: e.target.value as Religion })
                  }
                  className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {RELIGION_OPTIONS.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field 7: PEKERJAAN */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                7. PEKERJAAN *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.pekerjaan}
                  onChange={(e) => {
                    setFormData({ ...formData, pekerjaan: e.target.value.toUpperCase() });
                    if (errors.pekerjaan) setErrors({ ...errors, pekerjaan: "" });
                  }}
                  placeholder="KARYAWAN SWASTA / PNS / WIRASWASTA..."
                  className={`w-full h-9 px-3 text-sm uppercase rounded-lg border bg-background text-foreground focus:outline-none transition-all ${
                    errors.pekerjaan
                      ? "border-destructive ring-1 ring-destructive/40"
                      : "border-input focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  }`}
                  list="pekerjaan-suggestions"
                />
                <datalist id="pekerjaan-suggestions">
                  {OCCUPATION_OPTIONS.map((occ) => (
                    <option key={occ} value={occ} />
                  ))}
                </datalist>
              </div>
              {errors.pekerjaan && (
                <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{errors.pekerjaan}</span>
                </p>
              )}
            </div>
          </div>

          {/* Section: Wilayah & Klasifikasi Pemenangan */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-wider uppercase">
              <span>3. Domisili & Klasifikasi Pemenangan</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Field 8: RT */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  8. RT (3 Digit) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={formData.rt}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, rt: val });
                    }}
                    placeholder="001"
                    className="w-full h-9 px-3 text-sm font-mono text-center rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <select
                    value={RT_OPTIONS.includes(formData.rt) ? formData.rt : ""}
                    onChange={(e) => {
                      if (e.target.value) setFormData({ ...formData, rt: e.target.value });
                    }}
                    className="h-9 px-2 text-xs rounded-lg border border-input bg-background text-foreground cursor-pointer"
                  >
                    <option value="">Pilih</option>
                    {RT_OPTIONS.map((rt) => (
                      <option key={rt} value={rt}>
                        RT {rt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 9: RW */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  9. RW (3 Digit) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={formData.rw}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, rw: val });
                    }}
                    placeholder="001"
                    className="w-full h-9 px-3 text-sm font-mono text-center rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <select
                    value={RW_OPTIONS.includes(formData.rw) ? formData.rw : ""}
                    onChange={(e) => {
                      if (e.target.value) setFormData({ ...formData, rw: e.target.value });
                    }}
                    className="h-9 px-2 text-xs rounded-lg border border-input bg-background text-foreground cursor-pointer"
                  >
                    <option value="">Pilih</option>
                    {RW_OPTIONS.map((rw) => (
                      <option key={rw} value={rw}>
                        RW {rw}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 10: UNSUR PEMILIH */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  10. UNSUR PEMILIH *
                </label>
                <select
                  value={formData.unsurPemilih}
                  onChange={(e) =>
                    setFormData({ ...formData, unsurPemilih: e.target.value as UnsurPemilih })
                  }
                  className="w-full h-9 px-3 text-xs font-medium rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {UNSUR_PEMILIH_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 11: KATEGORI */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  11. KATEGORI PEMILIH *
                </label>
                <select
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, kategori: e.target.value as Kategori })
                  }
                  className="w-full h-9 px-3 text-xs font-semibold rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {KATEGORI_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
              className="text-xs gap-1.5 font-semibold cursor-pointer shadow-xs"
            >
              <Save className="size-3.5" />
              <span>{isSubmitting ? "Menyimpan..." : isEditMode ? "Perbarui Data" : "Simpan Penduduk"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
