"use client";

import React, { useState } from "react";
import { Resident } from "@/types/resident";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Phone,
  Copy,
  Check,
  UserX,
} from "lucide-react";

interface ResidentTableProps {
  residents: Resident[];
  onViewDetail: (resident: Resident) => void;
  onEdit: (resident: Resident) => void;
  onDelete: (resident: Resident) => void;
  onResetFilters?: () => void;
}

export function ResidentTable({
  residents,
  onViewDetail,
  onEdit,
  onDelete,
  onResetFilters,
}: ResidentTableProps) {
  // Paginasi State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const totalItems = residents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ambil slice untuk halaman aktif
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedResidents = residents.slice(startIndex, endIndex);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Helper untuk Badge Kategori
  const getKategoriBadge = (kategori: string) => {
    switch (kategori) {
      case "PRIORITAS 1":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            ★ P-1
          </span>
        );
      case "PRIORITAS 2":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
            P-2
          </span>
        );
      case "BINAAN":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            BINAAN
          </span>
        );
      case "POTENSIAL":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            POTENSIAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
            UMUM
          </span>
        );
    }
  };

  // Helper untuk Badge Unsur Pemilih
  const getUnsurBadge = (unsur: string) => {
    switch (unsur) {
      case "PEMILIH PEMULA":
        return (
          <Badge variant="outline" className="text-[11px] bg-blue-50/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800">
            Pemula
          </Badge>
        );
      case "LANSIA":
        return (
          <Badge variant="outline" className="text-[11px] bg-amber-50/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800">
            Lansia
          </Badge>
        );
      case "DISABILITAS":
        return (
          <Badge variant="outline" className="text-[11px] bg-rose-50/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800">
            Disabilitas
          </Badge>
        );
      case "TOKOH MASYARAKAT":
        return (
          <Badge variant="outline" className="text-[11px] bg-indigo-50/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 font-semibold">
            Tokoh
          </Badge>
        );
      case "TNI/POLRI PURNAWIRAWAN":
        return (
          <Badge variant="outline" className="text-[11px] bg-stone-50/50 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-800">
            Purnawirawan
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px] text-muted-foreground border-border">
            {unsur}
          </Badge>
        );
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Container Tabel dengan horizontal scroll */}
      <div className="relative overflow-x-auto">
        <Table className="w-full text-xs">
          <TableHeader className="bg-muted/60 sticky top-0 border-b border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-center font-bold">#</TableHead>
              {/* 11 KOLOM BAKU SESUAI PRD SEC 8.3 & URUTAN STANDAR */}
              <TableHead className="min-w-[150px] font-bold text-foreground">1. NIK</TableHead>
              <TableHead className="min-w-[150px] font-bold text-foreground">2. NO KK</TableHead>
              <TableHead className="min-w-[130px] font-bold text-foreground">3. NO HP</TableHead>
              <TableHead className="min-w-[180px] font-bold text-foreground">4. NAMA LENGKAP</TableHead>
              <TableHead className="min-w-[100px] font-bold text-foreground text-center">5. GENDER</TableHead>
              <TableHead className="min-w-[100px] font-bold text-foreground">6. AGAMA</TableHead>
              <TableHead className="min-w-[140px] font-bold text-foreground">7. PEKERJAAN</TableHead>
              <TableHead className="w-14 font-bold text-foreground text-center">8. RT</TableHead>
              <TableHead className="w-14 font-bold text-foreground text-center">9. RW</TableHead>
              <TableHead className="min-w-[150px] font-bold text-foreground">10. UNSUR PEMILIH</TableHead>
              <TableHead className="min-w-[110px] font-bold text-foreground text-center">11. KATEGORI</TableHead>
              {/* KOLOM AKSI */}
              <TableHead className="min-w-[110px] text-center font-bold text-foreground sticky right-0 bg-muted/90 backdrop-blur-xs">
                AKSI
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedResidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="h-64 text-center py-10">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-3">
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <UserX className="size-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        Tidak ada data ditemukan
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Coba sesuaikan kata kunci pencarian atau ubah kriteria filter yang sedang aktif.
                      </p>
                    </div>
                    {onResetFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onResetFilters}
                        className="text-xs mt-2 cursor-pointer"
                      >
                        Reset Filter
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedResidents.map((resident, idx) => {
                const rowNumber = startIndex + idx + 1;
                return (
                  <TableRow
                    key={resident.id}
                    className="hover:bg-muted/40 transition-colors border-b border-border/50 group"
                  >
                    {/* Index Number */}
                    <TableCell className="text-center font-mono text-muted-foreground text-[11px]">
                      {rowNumber}
                    </TableCell>

                    {/* 1. NIK */}
                    <TableCell className="font-mono font-medium text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{resident.nik}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(resident.nik, `nik-${resident.id}`)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity cursor-pointer p-0.5"
                          title="Salin NIK"
                        >
                          {copiedField === `nik-${resident.id}` ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* 2. NO KK */}
                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{resident.noKk}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(resident.noKk, `kk-${resident.id}`)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity cursor-pointer p-0.5"
                          title="Salin NO KK"
                        >
                          {copiedField === `kk-${resident.id}` ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* 3. NO HP */}
                    <TableCell className="whitespace-nowrap">
                      <a
                        href={`https://wa.me/${resident.noHp.replace(/^0/, "62")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-foreground hover:text-emerald-600 transition-colors"
                        title="Hubungi via WhatsApp"
                      >
                        <Phone className="size-3 text-muted-foreground" />
                        <span>{resident.noHp}</span>
                      </a>
                    </TableCell>

                    {/* 4. NAMA LENGKAP */}
                    <TableCell className="font-semibold text-foreground whitespace-nowrap">
                      {resident.namaLengkap}
                    </TableCell>

                    {/* 5. JENIS KELAMIN */}
                    <TableCell className="text-center whitespace-nowrap">
                      {resident.jenisKelamin === "LAKI-LAKI" ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          Laki-Laki
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                          Perempuan
                        </span>
                      )}
                    </TableCell>

                    {/* 6. AGAMA */}
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {resident.agama}
                    </TableCell>

                    {/* 7. PEKERJAAN */}
                    <TableCell className="text-muted-foreground whitespace-nowrap max-w-[150px] truncate" title={resident.pekerjaan}>
                      {resident.pekerjaan}
                    </TableCell>

                    {/* 8. RT */}
                    <TableCell className="text-center font-mono font-medium text-foreground">
                      {resident.rt}
                    </TableCell>

                    {/* 9. RW */}
                    <TableCell className="text-center font-mono font-medium text-foreground">
                      {resident.rw}
                    </TableCell>

                    {/* 10. UNSUR PEMILIH */}
                    <TableCell className="whitespace-nowrap">
                      {getUnsurBadge(resident.unsurPemilih)}
                    </TableCell>

                    {/* 11. KATEGORI */}
                    <TableCell className="text-center whitespace-nowrap">
                      {getKategoriBadge(resident.kategori)}
                    </TableCell>

                    {/* AKSI (Detail, Edit, Hapus) */}
                    <TableCell className="text-center whitespace-nowrap sticky right-0 bg-card/90 backdrop-blur-xs">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onViewDetail(resident)}
                          className="hover:text-primary hover:bg-primary/10 cursor-pointer"
                          title="Lihat Detail & KTP"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onEdit(resident)}
                          className="hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer"
                          title="Edit Data Penduduk"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onDelete(resident)}
                          className="hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Hapus Data"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Baris per halaman:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-7 px-2 text-xs rounded border border-input bg-background text-foreground focus:outline-none cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="hidden sm:inline">
            | Menampilkan {totalItems === 0 ? 0 : startIndex + 1} - {endIndex} dari {totalItems} data
          </span>
        </div>

        {/* Page Nav Buttons */}
        <div className="flex items-center gap-1">
          <span className="mr-2 text-xs font-medium text-foreground">
            Halaman {effectivePage} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => setCurrentPage(1)}
            disabled={effectivePage <= 1}
            title="Halaman Pertama"
            className="cursor-pointer"
          >
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={effectivePage <= 1}
            title="Halaman Sebelumnya"
            className="cursor-pointer"
          >
            <ChevronLeft className="size-3.5" />
          </Button>

          {/* Direct page indicators (up to 5 buttons) */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - effectivePage) <= 1 || p === 1 || p === totalPages)
            .map((p, idx, arr) => {
              const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
              return (
                <React.Fragment key={p}>
                  {showEllipsis && <span className="px-1 text-muted-foreground">...</span>}
                  <Button
                    variant={effectivePage === p ? "default" : "outline"}
                    size="icon-xs"
                    onClick={() => setCurrentPage(p)}
                    className="cursor-pointer text-[11px]"
                  >
                    {p}
                  </Button>
                </React.Fragment>
              );
            })}

          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={effectivePage >= totalPages}
            title="Halaman Berikutnya"
            className="cursor-pointer"
          >
            <ChevronRight className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => setCurrentPage(totalPages)}
            disabled={effectivePage >= totalPages}
            title="Halaman Terakhir"
            className="cursor-pointer"
          >
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
