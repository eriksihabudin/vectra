"use client";

import React, { useState } from "react";
import {
  Bot,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  Sparkles,
  Download,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function BotSimulatorTab({ onResidentAdded }: { onResidentAdded?: () => void }) {
  const [chatId, setChatId] = useState("123456789");
  const [caption, setCaption] = useState(
    "NO KK: 3201019900110022\nNO HP: 081298765432\nUNSUR PEMILIH: PEMILIH TETAP (DPT)\nKATEGORI: PRIORITAS 1"
  );
  const [sampleKtpText, setSampleKtpText] = useState(
    "REPUBLIK INDONESIA\n" +
      "NIK: 3201012507920088\n" +
      "NAMA: MAULANA YUSUF HAKIM\n" +
      "TEMPAT/TGL LAHIR: BOGOR, 25-07-1992\n" +
      "JENIS KELAMIN: LAKI-LAKI  GOL. DARAH: B\n" +
      "ALAMAT: JL. SULTAN HASANUDDIN NO. 14\n" +
      "   RT/RW: 004/002\n" +
      "   KEL/DESA: SUKARAJA\n" +
      "   KECAMATAN: SUKARAJA\n" +
      "AGAMA: ISLAM\n" +
      "STATUS PERKAWINAN: KAWIN\n" +
      "PEKERJAAN: WIRASWASTA\n" +
      "KEWARGANEGARAAN: WNI\n" +
      "BERLAKU HINGGA: SEUMUR HIDUP"
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulateWebhook = async (commitToDb = false) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/bot/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Bot-Api-Secret-Token": process.env.NEXT_PUBLIC_TELEGRAM_SECRET || "vectra_telegram_secret_2026",
        },
        body: JSON.stringify({
          simulate: true,
          chatId,
          ocrText: sampleKtpText,
          caption,
          commitToDb,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Simulasi gagal");
      } else {
        setResult(data);
        if (commitToDb && onResidentAdded) {
          onResidentAdded();
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Gagal menghubungi webhook bot");
    } finally {
      setLoading(false);
    }
  };

  const downloadSimulatedExcel = () => {
    if (!result?.mergedData) return;
    const url = `/api/export/excel?search=${result.mergedData.nik}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Bot className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Workbench Simulasi Bot Telegram & OCR KTP
              <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                Fase 2 Otomasi
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              Uji alur webhook Telegram lengkap: Ekstraksi OCR 7 atribut KTP + parsing 4 metadata teks + validasi NIK duplikat + simpan ke SQLite + kirim Excel .xlsx instan.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Upload className="size-4 text-primary" />
                1. Data Masukan Petugas Lapangan (Telegram Payload)
              </CardTitle>
              <CardDescription className="text-xs">
                Simulasi pesan gambar KTP dan pesan teks tambahan dari petugas lapangan.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Telegram Chat ID Pengirim:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs rounded-lg border border-input bg-background font-mono"
                    placeholder="123456789"
                  />
                  <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
                    Whitelist Terverifikasi
                  </Badge>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-foreground">
                    Hasil Ekstraksi OCR KTP (Raw OCR Dump):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomNik = "320101" + Math.floor(1000000000 + Math.random() * 9000000000);
                      setSampleKtpText((prev) => prev.replace(/NIK:\s*\d{16}/, `NIK: ${randomNik}`));
                    }}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="size-2.5" />
                    Acak NIK Baru
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={sampleKtpText}
                  onChange={(e) => setSampleKtpText(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono rounded-lg border border-input bg-background leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Caption / Pesan Teks 4 Atribut Pelengkap:
                </label>
                <textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono rounded-lg border border-input bg-background leading-relaxed"
                />
                <span className="text-[10px] text-muted-foreground block mt-1">
                  Mencakup: NO KK (16 digit), NO HP, UNSUR PEMILIH, dan KATEGORI.
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSimulateWebhook(false)}
                  disabled={loading}
                  className="flex-1 text-xs cursor-pointer"
                >
                  {loading ? "Memproses..." : "1. Uji Ekstraksi OCR Saja"}
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSimulateWebhook(true)}
                  disabled={loading}
                  className="flex-1 text-xs bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                >
                  <Sparkles className="size-3.5 mr-1" />
                  {loading ? "Menyimpan & Menghasilkan..." : "2. Ekstrak + Simpan DB + Buat Excel"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output & Preview Panel */}
        <div className="space-y-4">
          <Card className="border border-border/80 shadow-xs h-full flex flex-col">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                2. Hasil Penggabungan 11 Kolom Baku & File Excel
              </CardTitle>
              <CardDescription className="text-xs">
                Pratinjau otomatis data yang diproses oleh Telegram Bot & Excel Generator.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Galat Webhook</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {!result && !error && (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-xl text-muted-foreground">
                  <Bot className="size-10 mb-2 text-muted-foreground/40" />
                  <p className="text-xs font-medium text-foreground">Menunggu Simulasi Dijalankan</p>
                  <p className="text-[11px] max-w-xs mt-1">
                    Klik tombol &quot;Uji Ekstraksi OCR&quot; atau &quot;Ekstrak + Simpan DB&quot; untuk melihat alur parsing 11 kolom baku.
                  </p>
                </div>
              )}

              {result?.mergedData && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Check className="size-4 text-emerald-600" />
                      11 Kolom Baku Berhasil Terekstrak Sempurna!
                    </div>
                    <p className="text-[11px]">
                      Sistem berhasil mencocokkan regex NIK, Nama, RT/RW, JK, Agama, dan Atribut Pelengkap.
                    </p>
                  </div>

                  {/* 11 Columns Preview Grid */}
                  <div className="border border-border rounded-lg overflow-hidden text-xs">
                    <div className="bg-muted/60 p-2 font-semibold text-[11px] border-b border-border text-foreground">
                      Daftar 11 Atribut Baku Terstandarisasi:
                    </div>
                    <div className="divide-y divide-border/60">
                      <div className="grid grid-cols-3 p-1.5 px-2 bg-background">
                        <span className="text-muted-foreground font-medium">1. NIK:</span>
                        <span className="col-span-2 font-mono font-bold text-foreground">
                          {result.mergedData.nik}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 px-2 bg-muted/20">
                        <span className="text-muted-foreground font-medium">2. NO KK:</span>
                        <span className="col-span-2 font-mono text-foreground">
                          {result.mergedData.noKk}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 px-2 bg-background">
                        <span className="text-muted-foreground font-medium">3. NO HP:</span>
                        <span className="col-span-2 font-mono text-foreground">
                          {result.mergedData.noHp}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 px-2 bg-muted/20">
                        <span className="text-muted-foreground font-medium">4. NAMA:</span>
                        <span className="col-span-2 font-bold text-foreground">
                          {result.mergedData.namaLengkap}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 px-2 bg-background">
                        <span className="text-muted-foreground font-medium">5. GENDER:</span>
                        <span className="col-span-2 text-foreground">
                          {result.mergedData.jenisKelamin}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 px-2 bg-muted/20">
                        <span className="text-muted-foreground font-medium">6. AGAMA:</span>
                        <span className="col-span-2 text-foreground">
                          {result.mergedData.agama}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 px-2 bg-background">
                        <span className="text-muted-foreground font-medium">7. PEKERJAAN:</span>
                        <span className="col-span-2 text-foreground">
                          {result.mergedData.pekerjaan}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 px-2 bg-muted/20">
                        <span className="text-muted-foreground font-medium">8. RT / 9. RW:</span>
                        <span className="col-span-2 text-foreground">
                          RT {result.mergedData.rt} / RW {result.mergedData.rw}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 px-2 bg-background">
                        <span className="text-muted-foreground font-medium">10. UNSUR:</span>
                        <span className="col-span-2 text-foreground font-semibold text-blue-600 dark:text-blue-400">
                          {result.mergedData.unsurPemilih}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 p-1.5 px-2 bg-muted/20">
                        <span className="text-muted-foreground font-medium">11. KATEGORI:</span>
                        <span className="col-span-2 text-foreground font-semibold text-emerald-600 dark:text-emerald-400">
                          {result.mergedData.kategori}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Excel Generation Info & Instant Download */}
                  {result.excelGenerated && (
                    <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-md">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                          <FileSpreadsheet className="size-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">Dokumen Excel (.xlsx) Dibuat</p>
                          <p className="text-[10px] text-slate-400">
                            Ukuran: {result.excelGenerated.byteLength} bytes • 11 Kolom Baku Terformat
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={downloadSimulatedExcel}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer shrink-0"
                      >
                        <Download className="size-3.5 mr-1" />
                        Unduh .xlsx
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
