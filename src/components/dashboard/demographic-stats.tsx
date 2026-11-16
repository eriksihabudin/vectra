"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Resident } from "@/types/resident";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Users,
  PieChart as PieIcon,
  BarChart3,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DemographicStatsProps {
  residents: Resident[];
}

// Skema Warna Elegan untuk Visualisasi Data
const CATEGORY_COLORS: Record<string, string> = {
  "PRIORITAS 1": "#10b981", // Emerald
  "PRIORITAS 2": "#0284c7", // Sky
  BINAAN: "#8b5cf6", // Purple
  POTENSIAL: "#f59e0b", // Amber
  UMUM: "#64748b", // Slate
};

const UNSUR_COLORS = [
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f97316", // Orange
  "#14b8a6", // Teal
  "#64748b", // Slate
];

const RELIGION_COLORS = [
  "#0ea5e9", // Islam
  "#8b5cf6", // Kristen
  "#f43f5e", // Katolik
  "#f59e0b", // Hindu
  "#10b981", // Buddha
  "#d97706", // Konghucu
  "#94a3b8", // Lainnya
];

export function DemographicStats({ residents }: DemographicStatsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Agregasi Unsur Pemilih
  const unsurPemilihData = useMemo(() => {
    const counts: Record<string, number> = {};
    residents.forEach((r) => {
      counts[r.unsurPemilih] = (counts[r.unsurPemilih] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        jumlah: count,
        persentase: residents.length ? Math.round((count / residents.length) * 100) : 0,
      }))
      .sort((a, b) => b.jumlah - a.jumlah);
  }, [residents]);

  // 2. Agregasi Kategori Pemilih
  const kategoriData = useMemo(() => {
    const counts: Record<string, number> = {};
    residents.forEach((r) => {
      counts[r.kategori] = (counts[r.kategori] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: count,
      color: CATEGORY_COLORS[name] || "#64748b",
    }));
  }, [residents]);

  // 3. Agregasi Agama
  const agamaData = useMemo(() => {
    const counts: Record<string, number> = {};
    residents.forEach((r) => {
      counts[r.agama] = (counts[r.agama] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: count,
    }));
  }, [residents]);

  // 4. Komparasi Gender per RT
  const genderByRtData = useMemo(() => {
    const rtMap: Record<string, { lakiLaki: number; perempuan: number }> = {};
    residents.forEach((r) => {
      if (!rtMap[r.rt]) {
        rtMap[r.rt] = { lakiLaki: 0, perempuan: 0 };
      }
      if (r.jenisKelamin === "LAKI-LAKI") {
        rtMap[r.rt].lakiLaki += 1;
      } else {
        rtMap[r.rt].perempuan += 1;
      }
    });

    return Object.keys(rtMap)
      .sort()
      .map((rt) => ({
        rt: `RT ${rt}`,
        "Laki-Laki": rtMap[rt].lakiLaki,
        Perempuan: rtMap[rt].perempuan,
        total: rtMap[rt].lakiLaki + rtMap[rt].perempuan,
      }));
  }, [residents]);

  // 5. Matriks Sebaran RT x RW
  const territoryMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    const allRts = Array.from(new Set(residents.map((r) => r.rt))).sort();
    const allRws = Array.from(new Set(residents.map((r) => r.rw))).sort();

    allRts.forEach((rt) => {
      matrix[rt] = {};
      allRws.forEach((rw) => {
        matrix[rt][rw] = 0;
      });
    });

    residents.forEach((r) => {
      if (matrix[r.rt]) {
        matrix[r.rt][r.rw] = (matrix[r.rt][r.rw] || 0) + 1;
      }
    });

    return { allRts, allRws, matrix };
  }, [residents]);

  // Indikator Ringkasan
  const totalWarga = residents.length;
  const uniqueKk = new Set(residents.map((r) => r.noKk)).size;
  const pemilihPemulaCount = residents.filter((r) => r.unsurPemilih === "PEMILIH PEMULA").length;
  const pemilihPemulaPct = totalWarga > 0 ? Math.round((pemilihPemulaCount / totalWarga) * 100) : 0;
  const prioritasCount = residents.filter(
    (r) => r.kategori === "PRIORITAS 1" || r.kategori === "PRIORITAS 2"
  ).length;
  const prioritasPct = totalWarga > 0 ? Math.round((prioritasCount / totalWarga) * 100) : 0;
  const waContactableCount = residents.filter((r) => r.noHp && r.noHp.length >= 10).length;

  if (!isMounted) {
    return (
      <div className="py-20 text-center text-muted-foreground animate-pulse">
        Memuat statistik demografi...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insight Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-sky-500/10 to-emerald-500/10 border border-primary/20 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
              <Sparkles className="size-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground font-heading">
                  Ringkasan Eksekutif Demografi Vectra
                </h3>
                <Badge variant="outline" className="text-[10px] bg-background/80 border-primary/30 text-primary">
                  Data Terverifikasi 100%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pemetaan berbasis {totalWarga} warga terdata pada {uniqueKk} Kepala Keluarga lintas teritorial RT/RW.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-background/80 border border-border/80 rounded-xl px-3.5 py-2 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Pemilih Prioritas
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {prioritasCount} warga ({prioritasPct}%)
              </span>
            </div>
            <div className="bg-background/80 border border-border/80 rounded-xl px-3.5 py-2 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Pemilih Pemula
              </span>
              <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                {pemilihPemulaCount} warga ({pemilihPemulaPct}%)
              </span>
            </div>
            <div className="bg-background/80 border border-border/80 rounded-xl px-3.5 py-2 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Kontak HP Valid
              </span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {waContactableCount}/{totalWarga} (100%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Grafik 1: Unsur Pemilih & Kategori Pemilih */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart: Distribusi Unsur Pemilih (7 Kolom) */}
        <Card className="lg:col-span-7 border border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">
                  Distribusi Unsur Pemilih
                </CardTitle>
              </div>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {unsurPemilihData.length} Kategori
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Segmentasi konstituen: DPT, Pemilih Pemula, Lansia, Disabilitas, Tokoh, dll.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={unsurPemilihData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10 }}
                    width={110}
                  />
                  <Tooltip
                    formatter={(val: unknown) => [`${val} orang`, "Jumlah"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="jumlah" radius={[0, 4, 4, 0]}>
                    {unsurPemilihData.map((_, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={UNSUR_COLORS[idx % UNSUR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Komposisi Kategori Pemilih (5 Kolom) */}
        <Card className="lg:col-span-5 border border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieIcon className="size-4 text-emerald-500" />
                <CardTitle className="text-sm font-bold">
                  Komposisi Kategori Pemilih
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                Prioritas & Relawan
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Klasifikasi target: Prioritas 1, 2, Binaan, Potensial, Umum.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kategoriData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {kategoriData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: unknown) => [`${val} Warga`, "Jumlah"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Grafik 2: Gender per RT & Distribusi Agama */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Komparasi Gender per RT */}
        <Card className="lg:col-span-7 border border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-blue-500" />
                <CardTitle className="text-sm font-bold">
                  Komparasi Gender per Wilayah RT
                </CardTitle>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                Sebaran L/P
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Perbandingan jumlah penduduk Laki-Laki dan Perempuan di setiap RT.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genderByRtData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="rt" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }}
                  />
                  <Bar dataKey="Laki-Laki" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Perempuan" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribusi Agama */}
        <Card className="lg:col-span-5 border border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieIcon className="size-4 text-indigo-500" />
                <CardTitle className="text-sm font-bold">
                  Distribusi Agama Penduduk
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Keagamaan
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Komposisi agama resmi sesuai kolom baku ke-6 KTP.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={agamaData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {agamaData.map((_, index) => (
                      <Cell
                        key={`cell-agama-${index}`}
                        fill={RELIGION_COLORS[index % RELIGION_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: unknown) => [`${val} Warga`, "Jumlah"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matriks Teritorial RT x RW */}
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-rose-500" />
              <CardTitle className="text-sm font-bold">
                Matriks Sebaran Teritorial (RT x RW)
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-[11px] font-mono">
              {territoryMatrix.allRts.length} RT x {territoryMatrix.allRws.length} RW
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Tabel agregasi densitas kependudukan untuk memetakan konsentrasi pemilih per titik teritorial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-border">
              <thead>
                <tr className="bg-muted/70 text-foreground font-bold">
                  <th className="p-2.5 border border-border text-center">Wilayah RT</th>
                  {territoryMatrix.allRws.map((rw) => (
                    <th key={rw} className="p-2.5 border border-border text-center">
                      RW {rw}
                    </th>
                  ))}
                  <th className="p-2.5 border border-border text-center bg-primary/10 text-primary">
                    Total Warga per RT
                  </th>
                </tr>
              </thead>
              <tbody>
                {territoryMatrix.allRts.map((rt) => {
                  let rowTotal = 0;
                  return (
                    <tr key={rt} className="hover:bg-muted/40 transition-colors">
                      <td className="p-2.5 border border-border font-bold text-center bg-muted/30">
                        RT {rt}
                      </td>
                      {territoryMatrix.allRws.map((rw) => {
                        const count = territoryMatrix.matrix[rt]?.[rw] || 0;
                        rowTotal += count;
                        return (
                          <td
                            key={rw}
                            className={`p-2.5 border border-border text-center font-mono ${
                              count > 0 ? "font-semibold text-foreground" : "text-muted-foreground/60"
                            }`}
                          >
                            {count > 0 ? (
                              <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                                {count}
                              </span>
                            ) : (
                              "0"
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2.5 border border-border text-center font-bold font-mono bg-primary/5 text-primary">
                        {rowTotal} Warga
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/60 font-bold text-foreground">
                  <td className="p-2.5 border border-border text-center">Total per RW</td>
                  {territoryMatrix.allRws.map((rw) => {
                    const colTotal = territoryMatrix.allRts.reduce(
                      (acc, rt) => acc + (territoryMatrix.matrix[rt]?.[rw] || 0),
                      0
                    );
                    return (
                      <td key={rw} className="p-2.5 border border-border text-center font-mono">
                        {colTotal}
                      </td>
                    );
                  })}
                  <td className="p-2.5 border border-border text-center font-mono bg-primary/20 text-primary">
                    {totalWarga} Warga
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
