import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { residents, activityLogs } from "@/lib/db/schema";
import { residentSchema } from "@/lib/validations/resident";
import { eq, like, and, or, desc, asc, count } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/residents - List, search, filter, and paginate residents
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

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") || "100", 10)));
    const offset = (page - 1) * limit;

    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const conditions = [];

    // Search filter across NIK, Nama Lengkap, No KK, No HP
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

    // Total count query
    const [totalResult] = await db
      .select({ total: count() })
      .from(residents)
      .where(whereClause);
    const total = totalResult?.total || 0;

    // Order by column
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

    // Data query
    const data = await db
      .select()
      .from(residents)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: unknown) {
    console.error("Error GET /api/residents:", error);
    return NextResponse.json(
      { success: false, error: (error as Error)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/residents - Create new resident
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = residentSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi gagal",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validData = parseResult.data;

    // Check duplicate NIK
    const existing = await db
      .select()
      .from(residents)
      .where(eq(residents.nik, validData.nik))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `NIK ${validData.nik} sudah terdaftar atas nama ${existing[0].namaLengkap}`,
          existing: existing[0],
        },
        { status: 409 }
      );
    }

    const newId = crypto.randomUUID();
    const now = new Date();

    const newRecord = {
      id: newId,
      nik: validData.nik,
      noKk: validData.noKk,
      noHp: validData.noHp,
      namaLengkap: validData.namaLengkap,
      jenisKelamin: validData.jenisKelamin,
      agama: validData.agama,
      pekerjaan: validData.pekerjaan,
      rt: validData.rt,
      rw: validData.rw,
      unsurPemilih: validData.unsurPemilih,
      kategori: validData.kategori,
      fotoKtpPath: validData.fotoKtpPath || null,
      ocrRawText: validData.ocrRawText || null,
      telegramChatId: validData.telegramChatId || null,
      telegramSenderName: validData.telegramSenderName || null,
      createdByUserId: validData.createdByUserId || null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(residents).values(newRecord);

    // Audit log
    try {
      await db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        userId: validData.createdByUserId || null,
        action: "CREATE_RESIDENT",
        details: { nik: validData.nik, namaLengkap: validData.namaLengkap },
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        createdAt: now,
      });
    } catch (logErr) {
      console.warn("Failed to write activity log:", logErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Data penduduk berhasil ditambahkan",
        data: newRecord,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error POST /api/residents:", error);
    return NextResponse.json(
      { success: false, error: (error as Error)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
