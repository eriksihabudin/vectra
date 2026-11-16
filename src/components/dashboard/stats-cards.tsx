"use client";

import React from "react";
import { Resident } from "@/types/resident";
import { Users, Home, UserCheck, MapPin, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface StatsCardsProps {
  residents: Resident[];
}

export function StatsCards({ residents }: StatsCardsProps) {
  const totalPenduduk = residents.length;

  // Total KK unik
  const uniqueKkSet = new Set(residents.map((r) => r.noKk));
  const totalKk = uniqueKkSet.size;

  // Rasio Gender
  const maleCount = residents.filter((r) => r.jenisKelamin === "LAKI-LAKI").length;
  const femaleCount = residents.filter((r) => r.jenisKelamin === "PEREMPUAN").length;
  const malePct = totalPenduduk > 0 ? Math.round((maleCount / totalPenduduk) * 100) : 0;
  const femalePct = totalPenduduk > 0 ? Math.round((femaleCount / totalPenduduk) * 100) : 0;

  // Total Pemilih Terdaftar (DPT + Pemilih Pemula)
  const registeredVoters = residents.filter(
    (r) =>
      r.unsurPemilih === "PEMILIH TETAP (DPT)" ||
      r.unsurPemilih === "PEMILIH PEMULA" ||
      r.unsurPemilih === "LANSIA" ||
      r.unsurPemilih === "DISABILITAS" ||
      r.unsurPemilih === "TOKOH MASYARAKAT"
  ).length;

  // Cakupan Wilayah RT/RW
  const uniqueRt = new Set(residents.map((r) => r.rt)).size;
  const uniqueRw = new Set(residents.map((r) => r.rw)).size;

  // Kategori Prioritas 1
  const prioritas1Count = residents.filter((r) => r.kategori === "PRIORITAS 1").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Total Penduduk */}
      <Card className="border border-border/80 shadow-xs hover:border-border transition-all">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Penduduk
            </span>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight mt-1 text-foreground">
            {totalPenduduk.toLocaleString("id-ID")}
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
            Terverifikasi 11 Kolom
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 2. Total KK Unik */}
      <Card className="border border-border/80 shadow-xs hover:border-border transition-all">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Kepala Keluarga
            </span>
            <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Home className="size-4" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight mt-1 text-foreground">
            {totalKk.toLocaleString("id-ID")}
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
            No. KK Unik Terdaftar
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 3. Rasio Gender */}
      <Card className="border border-border/80 shadow-xs hover:border-border transition-all">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Rasio Gender
            </span>
            <div className="size-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Activity className="size-4" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight mt-1 text-foreground flex items-baseline gap-1.5">
            <span className="text-blue-600 dark:text-blue-400">{maleCount}</span>
            <span className="text-muted-foreground text-sm font-normal">/</span>
            <span className="text-pink-600 dark:text-pink-400">{femaleCount}</span>
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground mt-0.5 flex items-center justify-between">
            <span>L: {malePct}%</span>
            <span>P: {femalePct}%</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 4. Pemilih Terdata */}
      <Card className="border border-border/80 shadow-xs hover:border-border transition-all">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pemilih Potensial
            </span>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="size-4" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight mt-1 text-foreground">
            {registeredVoters.toLocaleString("id-ID")}
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
            Prioritas 1: <strong className="text-foreground">{prioritas1Count}</strong> Jiwa
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 5. Cakupan Wilayah */}
      <Card className="border border-border/80 shadow-xs hover:border-border transition-all sm:col-span-2 lg:col-span-1">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Cakupan Wilayah
            </span>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <MapPin className="size-4" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight mt-1 text-foreground">
            {uniqueRt} RT <span className="text-muted-foreground text-sm font-normal">/ {uniqueRw} RW</span>
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
            Sebaran Geografis Aktif
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
