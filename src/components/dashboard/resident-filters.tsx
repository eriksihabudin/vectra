"use client";

import React from "react";
import {
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { ResidentFilters } from "@/types/resident";
import {
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  UNSUR_PEMILIH_OPTIONS,
  KATEGORI_OPTIONS,
  RT_OPTIONS,
  RW_OPTIONS,
} from "@/data/mock-residents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FiltersProps {
  filters: ResidentFilters;
  onFilterChange: (key: keyof ResidentFilters, value: string) => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export function ResidentFiltersBar({
  filters,
  onFilterChange,
  onResetFilters,
  totalCount,
  filteredCount,
}: FiltersProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Hitung berapa filter yang sedang aktif
  const activeFilterCount = [
    filters.jenisKelamin,
    filters.agama,
    filters.rt,
    filters.rw,
    filters.unsurPemilih,
    filters.kategori,
  ].filter(Boolean).length;

  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-3.5 transition-all">
      {/* Baris Pertama: Input Pencarian & Filter Cepat */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Input Search Utama Multi-Kolom */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="Cari NIK, Nama Lengkap, No. KK, atau No. HP..."
            className="w-full h-9 pl-9 pr-8 text-sm rounded-lg border border-input bg-background/50 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange("search", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter: Kategori, RT/RW, dan Toggle Filter Lengkap */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Filter Cepat: Kategori */}
          <select
            value={filters.kategori}
            onChange={(e) => onFilterChange("kategori", e.target.value)}
            className="h-9 px-2.5 text-xs font-medium rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            {KATEGORI_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* Filter Cepat: RT */}
          <select
            value={filters.rt}
            onChange={(e) => onFilterChange("rt", e.target.value)}
            className="h-9 px-2.5 text-xs font-medium rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="">Semua RT</option>
            {RT_OPTIONS.map((rt) => (
              <option key={rt} value={rt}>
                RT {rt}
              </option>
            ))}
          </select>

          {/* Filter Cepat: RW */}
          <select
            value={filters.rw}
            onChange={(e) => onFilterChange("rw", e.target.value)}
            className="h-9 px-2.5 text-xs font-medium rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="">Semua RW</option>
            {RW_OPTIONS.map((rw) => (
              <option key={rw} value={rw}>
                RW {rw}
              </option>
            ))}
          </select>

          {/* Toggle Filter Lanjutan */}
          <Button
            type="button"
            variant={showAdvanced || activeFilterCount > 0 ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-9 gap-1.5 text-xs font-medium cursor-pointer"
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Filter Lanjutan</span>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="size-4 p-0 text-[10px] flex items-center justify-center rounded-full ml-0.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Reset Filter Button */}
          {(activeFilterCount > 0 || filters.search) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-9 gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              title="Reset semua filter dan pencarian"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Baris Kedua: Drawer Filter Lanjutan (Jika Diaktifkan) */}
      {showAdvanced && (
        <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in-50 duration-150">
          {/* Filter: Jenis Kelamin */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">
              Jenis Kelamin
            </label>
            <select
              value={filters.jenisKelamin}
              onChange={(e) => onFilterChange("jenisKelamin", e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Semua Jenis Kelamin</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Agama */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">
              Agama
            </label>
            <select
              value={filters.agama}
              onChange={(e) => onFilterChange("agama", e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Semua Agama</option>
              {RELIGION_OPTIONS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Unsur Pemilih */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">
              Unsur Pemilih
            </label>
            <select
              value={filters.unsurPemilih}
              onChange={(e) => onFilterChange("unsurPemilih", e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Semua Unsur Pemilih</option>
              {UNSUR_PEMILIH_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Status Baris Keterangan Hasil Filter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <div className="flex items-center gap-2">
          <span>
            Menampilkan <strong className="text-foreground">{filteredCount}</strong> dari{" "}
            <strong>{totalCount}</strong> total penduduk
          </span>
          {filteredCount !== totalCount && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-600 dark:text-amber-400">
              Terfilter
            </Badge>
          )}
        </div>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto">
            {filters.jenisKelamin && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                JK: {filters.jenisKelamin}
                <X
                  className="size-2.5 cursor-pointer hover:text-foreground"
                  onClick={() => onFilterChange("jenisKelamin", "")}
                />
              </Badge>
            )}
            {filters.rt && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                RT {filters.rt}
                <X
                  className="size-2.5 cursor-pointer hover:text-foreground"
                  onClick={() => onFilterChange("rt", "")}
                />
              </Badge>
            )}
            {filters.rw && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                RW {filters.rw}
                <X
                  className="size-2.5 cursor-pointer hover:text-foreground"
                  onClick={() => onFilterChange("rw", "")}
                />
              </Badge>
            )}
            {filters.kategori && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                {filters.kategori}
                <X
                  className="size-2.5 cursor-pointer hover:text-foreground"
                  onClick={() => onFilterChange("kategori", "")}
                />
              </Badge>
            )}
            {filters.unsurPemilih && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                {filters.unsurPemilih}
                <X
                  className="size-2.5 cursor-pointer hover:text-foreground"
                  onClick={() => onFilterChange("unsurPemilih", "")}
                />
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
