import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { residents } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Total Penduduk
    const [totalResidentsResult] = await db
      .select({ count: count() })
      .from(residents);
    const totalResidents = totalResidentsResult?.count || 0;

    // 2. Total KK Unik
    const [uniqueKkResult] = await db
      .select({ count: sql<number>`count(distinct ${residents.noKk})` })
      .from(residents);
    const totalKk = uniqueKkResult?.count || 0;

    // 3. Gender breakdown
    const genderBreakdown = await db
      .select({
        name: residents.jenisKelamin,
        value: count(),
      })
      .from(residents)
      .groupBy(residents.jenisKelamin);

    // 4. Unsur Pemilih breakdown
    const unsurPemilihBreakdown = await db
      .select({
        name: residents.unsurPemilih,
        value: count(),
      })
      .from(residents)
      .groupBy(residents.unsurPemilih);

    // 5. Kategori breakdown
    const kategoriBreakdown = await db
      .select({
        name: residents.kategori,
        value: count(),
      })
      .from(residents)
      .groupBy(residents.kategori);

    // 6. Agama breakdown
    const agamaBreakdown = await db
      .select({
        name: residents.agama,
        value: count(),
      })
      .from(residents)
      .groupBy(residents.agama);

    // 7. RT/RW Territorial Matrix
    const territorialMatrix = await db
      .select({
        rt: residents.rt,
        rw: residents.rw,
        count: count(),
      })
      .from(residents)
      .groupBy(residents.rt, residents.rw)
      .orderBy(residents.rw, residents.rt);

    return NextResponse.json({
      success: true,
      data: {
        totalResidents,
        totalKk,
        genderBreakdown,
        unsurPemilihBreakdown,
        kategoriBreakdown,
        agamaBreakdown,
        territorialMatrix,
      },
    });
  } catch (error: unknown) {
    console.error("Error in GET /api/stats:", error);
    return NextResponse.json(
      { success: false, error: (error as Error)?.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
