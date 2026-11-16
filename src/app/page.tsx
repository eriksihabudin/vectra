"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Resident, ResidentFilters, ResidentFormData } from "@/types/resident";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ResidentFiltersBar } from "@/components/dashboard/resident-filters";
import { ResidentTable } from "@/components/dashboard/resident-table";
import { ResidentFormModal } from "@/components/dashboard/resident-form-modal";
import { ResidentDetailModal } from "@/components/dashboard/resident-detail-modal";
import { ResidentDeleteModal } from "@/components/dashboard/resident-delete-modal";
import { DemographicStats } from "@/components/dashboard/demographic-stats";
import { BotSimulatorTab } from "@/components/dashboard/bot-simulator-tab";
import { UsersAndSystemTab } from "@/components/dashboard/users-tab";
import {
  Layers,
  FileSpreadsheet,
  Plus,
  LogOut,
  User,
  Shield,
  Bot,
  BarChart3,
  Users as UsersIcon,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function VectraApp() {
  const router = useRouter();
  const { data: session } = useSession();

  // Navigation State
  const [activeTab, setActiveTab] = useState<"table" | "stats" | "bot" | "users">("table");
  const [darkMode, setDarkMode] = useState(false);

  // Data State
  const [residents, setResidents] = useState<Resident[]>([]);
  const [, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Filters State
  const [filters, setFilters] = useState<ResidentFilters>({
    search: "",
    jenisKelamin: "",
    agama: "",
    rt: "",
    rw: "",
    unsurPemilih: "",
    kategori: "",
  });

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  // Load residents from API
  const fetchResidents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.jenisKelamin) params.append("jenisKelamin", filters.jenisKelamin);
      if (filters.agama) params.append("agama", filters.agama);
      if (filters.rt) params.append("rt", filters.rt);
      if (filters.rw) params.append("rw", filters.rw);
      if (filters.unsurPemilih) params.append("unsurPemilih", filters.unsurPemilih);
      if (filters.kategori) params.append("kategori", filters.kategori);
      params.append("limit", "500");

      const res = await fetch(`/api/residents?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setResidents(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data penduduk:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  // Handle Dark Mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const showToast = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleFilterChange = (key: keyof ResidentFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      jenisKelamin: "",
      agama: "",
      rt: "",
      rw: "",
      unsurPemilih: "",
      kategori: "",
    });
  };

  // Modal Handlers
  const handleOpenAddModal = () => {
    setSelectedResident(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (resident: Resident) => {
    setSelectedResident(resident);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (resident: Resident) => {
    setSelectedResident(resident);
    setIsDetailModalOpen(true);
  };

  const handleOpenDeleteModal = (resident: Resident) => {
    setSelectedResident(resident);
    setIsDeleteModalOpen(true);
  };

  // Save Resident (Create or Edit)
  const handleSaveResident = async (data: ResidentFormData) => {
    try {
      if (selectedResident && selectedResident.id) {
        // Edit Resident
        const res = await fetch(`/api/residents/${selectedResident.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const resJson = await res.json();
        if (!res.ok || !resJson.success) {
          showToast("error", resJson.error || "Gagal memperbarui data penduduk");
          return;
        }
        showToast("success", `Data warga ${data.namaLengkap} berhasil diperbarui`);
      } else {
        // Add Resident
        const res = await fetch("/api/residents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const resJson = await res.json();
        if (!res.ok || !resJson.success) {
          showToast("error", resJson.error || "Gagal menyimpan data penduduk");
          return;
        }
        showToast("success", `Warga baru ${data.namaLengkap} berhasil ditambahkan`);
      }

      setIsFormModalOpen(false);
      setSelectedResident(null);
      fetchResidents();
    } catch (err: unknown) {
      showToast("error", (err as Error).message || "Terjadi kesalahan jaringan");
    }
  };

  // Delete Resident
  const handleConfirmDelete = async () => {
    if (!selectedResident) return;
    try {
      const res = await fetch(`/api/residents/${selectedResident.id}`, {
        method: "DELETE",
      });
      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        showToast("error", resJson.error || "Gagal menghapus data");
        return;
      }
      showToast("success", `Data warga ${selectedResident.namaLengkap} berhasil dihapus`);
      setIsDeleteModalOpen(false);
      setSelectedResident(null);
      fetchResidents();
    } catch (err: unknown) {
      showToast("error", (err as Error).message || "Gagal menghapus");
    }
  };

  // Export Excel with Active Filters
  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.jenisKelamin) params.append("jenisKelamin", filters.jenisKelamin);
    if (filters.agama) params.append("agama", filters.agama);
    if (filters.rt) params.append("rt", filters.rt);
    if (filters.rw) params.append("rw", filters.rw);
    if (filters.unsurPemilih) params.append("unsurPemilih", filters.unsurPemilih);
    if (filters.kategori) params.append("kategori", filters.kategori);

    const downloadUrl = `/api/export/excel?${params.toString()}`;
    window.open(downloadUrl, "_blank");
    showToast("success", "Mengunduh berkas Excel 11 kolom baku...");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors">
      {/* Toast Notification */}
      {feedbackMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-medium ${
              feedbackMessage.type === "success"
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-800 backdrop-blur-md"
                : "bg-red-950/90 text-red-200 border-red-800 backdrop-blur-md"
            }`}
          >
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-red-400 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3">
            {/* Brand Logo & Status */}
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md ring-1 ring-white/20">
                <Layers className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-foreground font-heading">
                    VECTRA
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse mr-1 inline-block" />
                    Sistem Aktif
                  </Badge>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-mono">
                    v2.0
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  Administrasi Kependudukan & Pemetaan 11 Kolom Baku
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
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
                <UsersIcon className="size-3.5" />
                <span>Data Penduduk</span>
                <span className="ml-1 rounded-full bg-primary/10 text-primary px-1.5 py-0.2 text-[10px] font-bold">
                  {residents.length}
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
                <BarChart3 className="size-3.5" />
                <span>Statistik & Rekap</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bot")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === "bot"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bot className="size-3.5" />
                <span>Simulasi Bot & OCR</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === "users"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="size-3.5" />
                <span>Pengguna & Sistem</span>
              </button>
            </div>

            {/* Action Buttons & Auth Profile */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Ganti Tema Gelap / Terang"
              >
                {darkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="h-8 text-xs font-semibold border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
              >
                <FileSpreadsheet className="size-3.5 mr-1" />
                Ekspor Excel
              </Button>

              <Button
                size="sm"
                onClick={handleOpenAddModal}
                className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
              >
                <Plus className="size-3.5 mr-1" />
                Tambah Penduduk
              </Button>

              {session?.user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-foreground line-clamp-1">
                      {session.user.name}
                    </p>
                    <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono uppercase">
                      {session.user.role || "Operator"}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleSignOut}
                    title="Keluar (Sign Out)"
                    className="text-muted-foreground hover:text-red-600 cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/login")}
                  className="h-8 text-xs cursor-pointer"
                >
                  <User className="size-3.5 mr-1" />
                  Masuk
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top KPI Cards (Always visible on Table and Stats view) */}
        {(activeTab === "table" || activeTab === "stats") && (
          <StatsCards residents={residents} />
        )}

        {/* Tab 1: Tabel Data Kependudukan */}
        {activeTab === "table" && (
          <div className="space-y-4">
            <ResidentFiltersBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              totalCount={residents.length}
              filteredCount={residents.length}
            />

            <ResidentTable
              residents={residents}
              onViewDetail={handleOpenDetailModal}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
              onResetFilters={handleResetFilters}
            />
          </div>
        )}

        {/* Tab 2: Statistik & Visualisasi */}
        {activeTab === "stats" && <DemographicStats residents={residents} />}

        {/* Tab 3: Simulasi Bot Telegram & OCR */}
        {activeTab === "bot" && (
          <BotSimulatorTab onResidentAdded={fetchResidents} />
        )}

        {/* Tab 4: Pengguna & Sistem */}
        {activeTab === "users" && <UsersAndSystemTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-muted/20 py-4 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Vectra System — Administrasi Dokumen Kependudukan & Integrasi Bot Telegram.</p>
          <p className="font-mono text-[11px]">
            Node.js Runtime • SQLite WAL Mode • Better-Auth RBAC • ExcelJS 11-Columns Standard
          </p>
        </div>
      </footer>

      {/* Modals */}
      <ResidentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedResident(null);
        }}
        onSave={handleSaveResident}
        initialData={selectedResident}
        existingResidents={residents}
      />

      <ResidentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedResident(null);
        }}
        resident={selectedResident}
        onEdit={(resident) => {
          setIsDetailModalOpen(false);
          handleOpenEditModal(resident);
        }}
      />

      <ResidentDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedResident(null);
        }}
        onConfirm={handleConfirmDelete}
        resident={selectedResident}
      />
    </div>
  );
}
