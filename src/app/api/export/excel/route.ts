import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { residents, activityLogs } from "@/lib/db/schema";
import { generateResidentsExcel } from "@/lib/excel";
import { eq, like, and, or, desc, asc } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/export/excel - Export residents data to standard Excel (.xlsx)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const jenisKelamin = searchParams.get("jenisKelamin")?.trim() || "";
    const agama = searchParams.get("agama")?.trim() || "";
    const rt = searchParams.get("rt")?.trim() || "";
    const rw = searchParams.get("rw")?.trim() || "";
    const unsurPemilih = searchParams.get("unsurPemilih")?.trim() || "";
    const kategori = searchParams.get("kategori")?.trim() || "";

    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const conditions = [];

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          like(residents.nik, searchPattern),
          like(residents.namaLengkap, searchPattern),
          like(residents.noKk, searchPattern),
          like(residents.noHp, searchPattern)
        )
      );
    }

    if (jenisKelamin) {
      conditions.push(eq(residents.jenisKelamin, jenisKelamin.toUpperCase()));
    }
    if (agama) {
      conditions.push(eq(residents.agama, agama.toUpperCase()));
    }
    if (rt) {
      conditions.push(eq(residents.rt, rt.padStart(3, "0")));
    }
    if (rw) {
      conditions.push(eq(residents.rw, rw.padStart(3, "0")));
    }
    if (unsurPemilih) {
      conditions.push(eq(residents.unsurPemilih, unsurPemilih));
    }
    if (kategori) {
      conditions.push(eq(residents.kategori, kategori));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const getOrderColumn = () => {
      switch (sortBy) {
        case "nik":
          return residents.nik;
        case "namaLengkap":
          return residents.namaLengkap;
        case "rt":
          return residents.rt;
        case "rw":
          return residents.rw;
        default:
          return residents.createdAt;
      }
    };

    const orderByClause = sortOrder === "asc" ? asc(getOrderColumn()) : desc(getOrderColumn());

    const data = await db
      .select()
      .from(residents)
      .where(whereClause)
      .orderBy(orderByClause);

    // Generate Excel Buffer using ExcelJS
    const buffer = await generateResidentsExcel(data, "Data Penduduk Vectra");

    // Audit log
    try {
      await db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        action: "EXPORT_XLSX",
        details: {
          exportedCount: data.length,
          filters: { search, jenisKelamin, agama, rt, rw, unsurPemilih, kategori },
        },
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        createdAt: new Date(),
      });
    } catch (logErr) {
      console.warn("Failed to write activity log:", logErr);
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `data-penduduk-vectra-${timestamp}.xlsx`;

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate Excel file";
    console.error("Error GET /api/export/excel:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
