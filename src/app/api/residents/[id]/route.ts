import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { residents, activityLogs } from "@/lib/db/schema";
import { residentUpdateSchema } from "@/lib/validations/resident";
import { eq, or, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/residents/[id]
 * Get single resident by ID or NIK
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const record = await db
      .select()
      .from(residents)
      .where(or(eq(residents.id, id), eq(residents.nik, id)))
      .limit(1);

    if (record.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data penduduk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record[0],
    });
  } catch (error) {
    console.error("Error retrieving resident:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data penduduk" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/residents/[id]
 * Update resident data
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parseResult = residentUpdateSchema.safeParse(body);
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

    const updateData = parseResult.data;

    // Check if resident exists
    const existing = await db
      .select()
      .from(residents)
      .where(eq(residents.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data penduduk tidak ditemukan" },
        { status: 404 }
      );
    }

    // If updating NIK, verify no other resident has that NIK
    if (updateData.nik && updateData.nik !== existing[0].nik) {
      const duplicate = await db
        .select()
        .from(residents)
        .where(eq(residents.nik, updateData.nik))
        .limit(1);

      if (duplicate.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `NIK ${updateData.nik} sudah digunakan oleh data penduduk lain`,
          },
          { status: 409 }
        );
      }
    }

    // Optional user session context
    let userId: string | null = null;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch {
      // Ignore if called without session
    }

    const updated = await db
      .update(residents)
      .set({
        ...updateData,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(residents.id, id))
      .returning();

    // Log Activity
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    await db.insert(activityLogs).values({
      userId,
      action: "UPDATE_RESIDENT",
      details: { residentId: id, updatedFields: Object.keys(updateData) },
      ipAddress,
    });

    return NextResponse.json({
      success: true,
      message: "Data penduduk berhasil diperbarui",
      data: updated[0],
    });
  } catch (error) {
    console.error("Error updating resident:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui data penduduk" },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;

/**
 * DELETE /api/residents/[id]
 * Delete resident record
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await db
      .select()
      .from(residents)
      .where(eq(residents.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data penduduk tidak ditemukan" },
        { status: 404 }
      );
    }

    let userId: string | null = null;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch {
      // Ignore
    }

    await db.delete(residents).where(eq(residents.id, id));

    // Log Activity
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    await db.insert(activityLogs).values({
      userId,
      action: "DELETE_RESIDENT",
      details: { residentId: id, nik: existing[0].nik, namaLengkap: existing[0].namaLengkap },
      ipAddress,
    });

    return NextResponse.json({
      success: true,
      message: "Data penduduk berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting resident:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus data penduduk" },
      { status: 500 }
    );
  }
}
