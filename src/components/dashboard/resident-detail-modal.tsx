"use client";

import React, { useState } from "react";
import { Resident } from "@/types/resident";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Copy,
  Check,
  CreditCard,
  Phone,
  ShieldCheck,
  Pencil,
  Clock,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

interface DetailModalProps {
  resident: Resident | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (resident: Resident) => void;
}

export function ResidentDetailModal({
  resident,
  isOpen,
  onClose,
  onEdit,
}: DetailModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !resident) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const isHpValid = /^(08|\+628)\d{8,12}$/.test(resident.noHp.replace(/\s+/g, ""));
  const isNikValid = /^\d{16}$/.test(resident.nik);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150">
      <div
        className="bg-card text-card-foreground border border-border w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground font-heading">
                  Berkas Profil Kependudukan
                </h2>
                <Badge variant="outline" className="text-[10px] px-2 py-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                  <CheckCircle2 className="size-3 mr-1 inline" />
                  Terverifikasi
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Pratinjau e-KTP & 11 Atribut Baku Data Kependudukan
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

        {/* Content Body: Dua Kolom (Kiri: Mock e-KTP, Kanan: 11 Kolom Baku) */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Simulasi Kartu e-KTP Indonesia (5 Col) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="size-4" />
              <span>Simulasi Fisik e-KTP</span>
            </div>

            {/* Realistic KTP Card Mockup */}
            <div className="relative rounded-xl border border-sky-300 dark:border-sky-800 bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100 dark:from-slate-900 dark:via-sky-950 dark:to-slate-900 p-4 shadow-md text-slate-800 dark:text-slate-100 font-sans text-[11px] overflow-hidden select-none">
              {/* Garuda Watermark Background Simulation */}
              <div className="absolute right-3 top-3 opacity-15 pointer-events-none">
                <div className="size-20 rounded-full border-4 border-dashed border-sky-700 flex items-center justify-center font-bold text-[10px]">
                  REPUBLIK INDONESIA
                </div>
              </div>

              {/* KTP Header */}
              <div className="text-center font-bold tracking-wider leading-tight pb-2 border-b border-sky-300/60 dark:border-sky-700/60">
                <p className="text-[10px]">PROVINSI JAWA BARAT</p>
                <p className="text-[11px] font-extrabold">KABUPATEN BOGOR</p>
              </div>

              {/* NIK Display on Card */}
              <div className="my-2 flex items-baseline gap-2">
                <span className="font-extrabold text-[12px] tracking-wider font-mono">
                  NIK
                </span>
                <span className="font-mono font-bold text-[13px] tracking-widest text-sky-950 dark:text-sky-200">
                  : {resident.nik}
                </span>
              </div>

              {/* KTP Details & Simulated Photo Grid */}
              <div className="grid grid-cols-12 gap-2 mt-2">
                <div className="col-span-8 space-y-1 leading-snug text-[10px]">
                  <div className="grid grid-cols-3">
                    <span className="font-semibold">Nama</span>
                    <span className="col-span-2 font-bold uppercase truncate">: {resident.namaLengkap}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-semibold">Jenis Kelamin</span>
                    <span className="col-span-2">: {resident.jenisKelamin}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-semibold">Alamat</span>
                    <span className="col-span-2">: RT {resident.rt} / RW {resident.rw}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-semibold">Agama</span>
                    <span className="col-span-2">: {resident.agama}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-semibold">Pekerjaan</span>
                    <span className="col-span-2 uppercase truncate">: {resident.pekerjaan}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-semibold">Kewarganegaraan</span>
                    <span className="col-span-2">: WNI</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-semibold">Berlaku Hingga</span>
                    <span className="col-span-2">: SEUMUR HIDUP</span>
                  </div>
                </div>

                {/* Simulated Photo Placeholder */}
                <div className="col-span-4 flex flex-col items-center justify-between">
                  <div className="w-full aspect-[3/4] rounded-md border-2 border-slate-300 dark:border-slate-700 bg-gradient-to-b from-blue-200 to-blue-400 dark:from-slate-700 dark:to-slate-800 flex flex-col items-center justify-center p-1 shadow-inner text-center">
                    <div className="size-10 rounded-full bg-blue-100 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs mb-1">
                      {resident.namaLengkap.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[8px] font-bold text-blue-900 dark:text-blue-200 uppercase tracking-tighter">
                      PAS FOTO KTP
                    </span>
                  </div>
                  <div className="text-[8px] font-mono mt-1 text-center text-muted-foreground">
                    CHIP TERPROTEKSI
                  </div>
                </div>
              </div>
            </div>

            {/* Indikator Kelengkapan Data */}
            <div className="rounded-xl border border-border p-3 space-y-2 bg-muted/20">
              <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                Indikator Integritas Data
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Validasi NIK 16 Digit:</span>
                  <Badge variant={isNikValid ? "default" : "destructive"} className="text-[10px] py-0 px-2">
                    {isNikValid ? "Valid 16 Digit" : "Format Salah"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Validasi Seluler (+62/08):</span>
                  <Badge variant={isHpValid ? "default" : "destructive"} className="text-[10px] py-0 px-2">
                    {isHpValid ? "Valid Seluler" : "Perlu Koreksi"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Klasifikasi Kategori:</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-2 font-semibold">
                    {resident.kategori}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Rincian Lengkap 11 Kolom Baku & Audit (7 Col) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center justify-between">
              <span>Rincian 11 Kolom Baku Kependudukan</span>
              <span className="text-[11px] font-mono text-muted-foreground">
                ID: {resident.id}
              </span>
            </div>

            {/* List 11 Kolom Baku */}
            <div className="rounded-xl border border-border divide-y divide-border/60 bg-card overflow-hidden">
              {/* 1. NIK */}
              <div className="p-2.5 px-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">1. NIK</p>
                  <p className="text-xs font-mono font-bold text-foreground">{resident.nik}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => copyToClipboard(resident.nik, "nik")}
                  className="cursor-pointer"
                  title="Salin NIK"
                >
                  {copiedKey === "nik" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* 2. NO KK */}
              <div className="p-2.5 px-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">2. NO KK</p>
                  <p className="text-xs font-mono font-bold text-foreground">{resident.noKk}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => copyToClipboard(resident.noKk, "noKk")}
                  className="cursor-pointer"
                  title="Salin NO KK"
                >
                  {copiedKey === "noKk" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* 3. NO HP */}
              <div className="p-2.5 px-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">3. NO HP / WhatsApp</p>
                  <a
                    href={`https://wa.me/${resident.noHp.replace(/^0/, "62")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono font-bold text-foreground hover:text-emerald-600 flex items-center gap-1.5"
                  >
                    <Phone className="size-3 text-emerald-500" />
                    <span>{resident.noHp}</span>
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => copyToClipboard(resident.noHp, "noHp")}
                  className="cursor-pointer"
                  title="Salin NO HP"
                >
                  {copiedKey === "noHp" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* 4. NAMA LENGKAP */}
              <div className="p-2.5 px-3 hover:bg-muted/30 transition-colors">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">4. NAMA LENGKAP</p>
                <p className="text-xs font-bold text-foreground">{resident.namaLengkap}</p>
              </div>

              {/* 5. JENIS KELAMIN & 6. AGAMA */}
              <div className="grid grid-cols-2 divide-x divide-border/60">
                <div className="p-2.5 px-3 hover:bg-muted/30 transition-colors">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">5. JENIS KELAMIN</p>
                  <p className="text-xs font-semibold text-foreground">{resident.jenisKelamin}</p>
                </div>
                <div className="p-2.5 px-3 hover:bg-muted/30 transition-colors">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">6. AGAMA</p>
                  <p className="text-xs font-semibold text-foreground">{resident.agama}</p>
                </div>
              </div>

              {/* 7. PEKERJAAN */}
              <div className="p-2.5 px-3 hover:bg-muted/30 transition-colors">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">7. PEKERJAAN</p>
                <p className="text-xs font-medium text-foreground">{resident.pekerjaan}</p>
              </div>

              {/* 8. RT & 9. RW */}
              <div className="grid grid-cols-2 divide-x divide-border/60">
                <div className="p-2.5 px-3 hover:bg-muted/30 transition-colors">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">8. RT</p>
                  <p className="text-xs font-mono font-bold text-foreground">RT {resident.rt}</p>
                </div>
                <div className="p-2.5 px-3 hover:bg-muted/30 transition-colors">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">9. RW</p>
                  <p className="text-xs font-mono font-bold text-foreground">RW {resident.rw}</p>
                </div>
              </div>

              {/* 10. UNSUR PEMILIH & 11. KATEGORI */}
              <div className="grid grid-cols-2 divide-x divide-border/60">
                <div className="p-2.5 px-3 hover:bg-muted/30 transition-colors">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">10. UNSUR PEMILIH</p>
                  <p className="text-xs font-semibold text-foreground">{resident.unsurPemilih}</p>
                </div>
                <div className="p-2.5 px-3 hover:bg-muted/30 transition-colors">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">11. KATEGORI</p>
                  <p className="text-xs font-bold text-foreground">{resident.kategori}</p>
                </div>
              </div>
            </div>

            {/* Audit Trail Info */}
            <div className="rounded-xl border border-border/80 p-3 bg-muted/30 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <UserCheck className="size-3.5" />
                <span>Penginput: <strong className="text-foreground">{resident.createdBy || "Admin"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5" />
                <span>
                  Waktu Pendaftaran:{" "}
                  <strong className="text-foreground">
                    {new Date(resident.createdAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-border flex items-center justify-between bg-muted/40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(resident);
            }}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <Pencil className="size-3.5" />
            <span>Koreksi / Edit Data</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
