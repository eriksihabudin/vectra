import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { telegramWhitelistedUsers } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(telegramWhitelistedUsers)
      .orderBy(desc(telegramWhitelistedUsers.createdAt));

    return NextResponse.json({ success: true, data: list });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chatId, username, fullName } = body;

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "Telegram Chat ID wajib diisi" },
        { status: 400 }
      );
    }

    const cleanChatId = String(chatId).trim();

    // Check duplicate
    const existing = await db
      .select()
      .from(telegramWhitelistedUsers)
      .where(eq(telegramWhitelistedUsers.chatId, cleanChatId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Telegram Chat ID ${cleanChatId} sudah terdaftar` },
        { status: 409 }
      );
    }

    const newRecord = {
      id: crypto.randomUUID(),
      chatId: cleanChatId,
      username: username ? String(username).replace("@", "").trim() : null,
      fullName: fullName ? String(fullName).trim() : null,
      isActive: true,
      createdAt: new Date(),
    };

    await db.insert(telegramWhitelistedUsers).values(newRecord);

    return NextResponse.json({
      success: true,
      message: "Akun Telegram berhasil didaftarkan ke whitelist",
      data: newRecord,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID wajib diisi" }, { status: 400 });
    }

    await db.delete(telegramWhitelistedUsers).where(eq(telegramWhitelistedUsers.id, id));

    return NextResponse.json({ success: true, message: "Whitelist berhasil dihapus" });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
