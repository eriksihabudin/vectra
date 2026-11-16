"use client";

import React from "react";
import {
  Users,
  Moon,
  Sun,
  ShieldCheck,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  totalCount: number;
  filteredCount: number;
  onOpenAddModal: () => void;
  onExport: () => void;
  onResetData: () => void;
  activeTab: "table" | "stats";
  setActiveTab: (tab: "table" | "stats") => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export function DashboardHeader({
  totalCount,
  filteredCount,
  onOpenAddModal,
  onExport,
  onResetData,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-primary-foreground shadow-md ring-1 ring-border">
              <Layers className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground font-heading">
                  VECTRA
                </h1>
                <Badge variant="outline" className="text-[11px] px-2 py-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse mr-1 inline-block" />
                  Sistem Aktif
                </Badge>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                  v2.0
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Sistem Basis Data Kependudukan & Pemetaan Presisi 11 Kolom Baku
              </p>
            </div>
          </div>

          {/* Quick Actions & Navigation Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* View Switcher: Tabel Data vs Statistik */}
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("table")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === "table"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="size-3.5" />
                <span>Tabel Penduduk</span>
                <span className="ml-1 rounded-full bg-primary/10 text-primary px-1.5 py-0.2 text-[10px] font-bold">
                  {filteredCount === totalCount ? totalCount : `${filteredCount}/${totalCount}`}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("stats")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === "stats"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldCheck className="size-3.5" />
                <span>Statistik Demografi</span>
              </button>
            </div>

            {/* Tombol Ekspor Excel */}
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-1.5 text-xs font-medium border-border hover:bg-accent cursor-pointer"
              title="Unduh dataset sesuai 11 kolom baku Excel"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Ekspor Excel</span>
            </Button>

            {/* Tombol Tambah Warga */}
            <Button
              variant="default"
              size="sm"
              onClick={onOpenAddModal}
              className="gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Tambah Penduduk</span>
            </Button>

            {/* Reset Data Mock */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onResetData}
              title="Reset ke Data Standar Awal"
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
            </Button>

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {darkMode ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-slate-700" />
              )}
            </Button>

            {/* User Profile Pill */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-border">
              <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                AD
              </div>
              <div className="text-left text-xs leading-tight">
                <p className="font-semibold text-foreground">Admin Wilayah</p>
                <p className="text-[10px] text-muted-foreground">Hak Akses Penuh</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
