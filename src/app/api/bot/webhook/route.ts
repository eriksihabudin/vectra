import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  residents,
  telegramWhitelistedUsers,
  telegramConversationStates,
  activityLogs,
} from "@/lib/db/schema";
import { telegramBot } from "@/lib/telegram";
import { extractKtpFromImage } from "@/lib/ocr";
import { generateResidentsExcel } from "@/lib/excel";
import { eq, desc } from "drizzle-orm";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/bot/webhook
 * Handles incoming Telegram Bot Webhook updates:
 * - Secret token verification
 * - User whitelist check
 * - Photo reception, Sharp preprocessing & OCR extraction
 * - Multi-step conversational state handling for 11 standard columns
 * - Immediate Excel (.xlsx) compilation & delivery upon database save
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify Webhook Secret Token (if configured)
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secretToken) {
      const headerSecret = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
      if (headerSecret !== secretToken) {
        console.warn("Unauthorized Telegram webhook request: secret mismatch");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const update = await req.json();

    // 2. Handle Inline Button Callback Queries
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
      return NextResponse.json({ ok: true });
    }

    // 3. Handle Chat Messages
    if (update.message) {
      await handleMessage(update.message);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error processing Telegram webhook:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

/**
 * Check if the user is authorized via Telegram Whitelist
 */
async function isUserAuthorized(chatId: string): Promise<boolean> {
  const activeWhitelists = await db
    .select()
    .from(telegramWhitelistedUsers)
    .where(eq(telegramWhitelistedUsers.isActive, true));

  // If no whitelist records are configured, allow access (open mode)
  if (activeWhitelists.length === 0) {
    return true;
  }

  // If whitelist records exist, user must be in the list
  const match = activeWhitelists.find((u) => u.chatId === chatId);
  return Boolean(match);
}

/**
 * Handle incoming chat messages (photos, commands, text)
 */
async function handleMessage(message: any) {
  const chatId = String(message.chat?.id || "");
  const senderName =
    [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") ||
    message.from?.username ||
    "Petugas Lapangan";
  const text = (message.text || message.caption || "").trim();

  if (!chatId) return;

  // Authorization check
  const authorized = await isUserAuthorized(chatId);
  if (!authorized) {
    await telegramBot.sendMessage(
      chatId,
      `⛔ *Akses Ditolak*\n\nID Telegram Anda (\`${chatId}\`) belum terdaftar dalam daftar petugas berwenang sistem Vectra. Hubungi Administrator untuk didaftarkan.`
    );
    return;
  }

  // Handle Commands
  if (text.startsWith("/")) {
    await handleCommand(chatId, text, senderName);
    return;
  }

  // Handle Photo Messages (KTP Upload)
  if (message.photo && message.photo.length > 0) {
    await handleKtpPhotoUpload(chatId, message.photo, text, senderName);
    return;
  }

  // Handle Text Messages for Conversation Steps
  await handleConversationText(chatId, text, senderName);
}

/**
 * Handle Bot Slash Commands
 */
async function handleCommand(chatId: string, commandText: string, senderName: string) {
  const cmd = commandText.split(" ")[0].toLowerCase();

  if (cmd === "/start" || cmd === "/bantuan" || cmd === "/help") {
    await telegramBot.sendMessage(
      chatId,
      `👋 *Halo, ${senderName}!*\n` +
        `Selamat datang di *Bot Kependudukan Vectra*.\n\n` +
        `Bot ini mempermudah entri data KTP langsung ke basis data pusat secara otomatis.\n\n` +
        `📋 *Alur Penggunaan:*\n` +
        `1. Kirim foto KTP yang terbaca jelas.\n` +
        `2. Bot akan mengekstrak data identitas via OCR (NIK, Nama, JK, Agama, Pekerjaan, RT, RW).\n` +
        `3. Kirimkan 4 data pelengkap dengan format:\n` +
        `   \`NO KK#NO HP#UNSUR PEMILIH#KATEGORI\`\n` +
        `4. Tekan tombol *[✅ Simpan ke Database]*.\n` +
        `5. Bot akan langsung mengirimkan file dokumen *Excel (.xlsx)* resmi hasil input!\n\n` +
        `*Perintah Lainnya:*\n` +
        `• \`/status\` - Periksa status sistem & jumlah data\n` +
        `• \`/rekap\` - Unduh rekap Excel data yang Anda input\n` +
        `• \`/batal\` - Batalkan proses input yang aktif`
    );
    return;
  }

  if (cmd === "/batal") {
    await db
      .delete(telegramConversationStates)
      .where(eq(telegramConversationStates.chatId, chatId));

    await telegramBot.sendMessage(
      chatId,
      `🔄 *Proses Telah Dibatalkan*\n` +
        `Sesi input data telah dibersihkan. Anda dapat mengirimkan foto KTP baru kapan saja.`
    );
    return;
  }

  if (cmd === "/status") {
    const totalData = await db.select().from(residents);
    await telegramBot.sendMessage(
      chatId,
      `📊 *Status Sistem Vectra:*\n` +
        `• Basis Data: *Aktif (SQLite WAL Mode)*\n` +
        `• Total Penduduk Terdaftar: *${totalData.length} jiwa*\n` +
        `• ID Chat Telegram Anda: \`${chatId}\`\n` +
        `• Petugas: *${senderName}*`
    );
    return;
  }

  if (cmd === "/rekap") {
    const myData = await db
      .select()
      .from(residents)
      .where(eq(residents.telegramChatId, chatId))
      .orderBy(desc(residents.createdAt));

    if (myData.length === 0) {
      await telegramBot.sendMessage(
        chatId,
        `ℹ️ Belum ada data kependudukan yang Anda inputkan melalui bot ini.`
      );
      return;
    }

    const excelBuffer = await generateResidentsExcel(
      myData,
      `Rekap Input ${senderName.slice(0, 15)}`
    );
    const dateStr = new Date().toISOString().slice(0, 10);
    await telegramBot.sendDocument(
      chatId,
      excelBuffer,
      `rekap_input_${chatId}_${dateStr}.xlsx`,
      `📊 *Rekap Data Input Anda*\nTotal: *${myData.length} data penduduk*. Berkas Excel terlampir.`
    );
    return;
  }

  await telegramBot.sendMessage(
    chatId,
    `Perintah tidak dikenal. Ketik \`/bantuan\` untuk melihat panduan penggunaan.`
  );
}

/**
 * Handle KTP Photo Upload: download, Sharp preprocess, OCR, state management
 */
async function handleKtpPhotoUpload(
  chatId: string,
  photos: any[],
  captionText: string,
  senderName: string
) {
  await telegramBot.sendMessage(chatId, `⏳ *Sedang memproses foto KTP dengan engine OCR...*`);

  try {
    // Pick highest resolution photo
    const highestPhoto = photos[photos.length - 1];
    const fileMeta = await telegramBot.getFile(highestPhoto.file_id);

    if (!fileMeta?.file_path) {
      await telegramBot.sendMessage(
        chatId,
        `❌ Gagal mengunduh gambar dari Telegram. Silakan kirim ulang foto KTP.`
      );
      return;
    }

    const imageBuffer = await telegramBot.downloadFile(fileMeta.file_path);
    if (!imageBuffer) {
      await telegramBot.sendMessage(
        chatId,
        `❌ Gagal memuat file gambar. Silakan coba kirim ulang.`
      );
      return;
    }

    // Save local copy under ./data/uploads/ktp
    const uploadDir = path.resolve(process.cwd(), "./data/uploads/ktp");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const localFileName = `ktp_${Date.now()}_${highestPhoto.file_id.slice(0, 8)}.jpg`;
    const localFilePath = path.join(uploadDir, localFileName);
    fs.writeFileSync(localFilePath, imageBuffer);

    // Run OCR & Regex Parsing
    const parsedKtp = await extractKtpFromImage(imageBuffer);

    // If caption contains supplemental data format: NO KK#NO HP#UNSUR PEMILIH#KATEGORI
    const captionParts = captionText
      ? captionText.split(/[#\n]/).map((s) => s.trim())
      : [];

    if (captionParts.length >= 4 && parsedKtp.nik) {
      // Full 11 columns available immediately!
      const fullData = {
        nik: parsedKtp.nik,
        noKk: captionParts[0],
        noHp: captionParts[1],
        namaLengkap: parsedKtp.namaLengkap || "NAMA TIDAK TERDETEKSI",
        jenisKelamin: parsedKtp.jenisKelamin,
        agama: parsedKtp.agama,
        pekerjaan: parsedKtp.pekerjaan,
        rt: parsedKtp.rt,
        rw: parsedKtp.rw,
        unsurPemilih: captionParts[2],
        kategori: captionParts[3],
        fotoKtpPath: localFilePath,
        ocrRawText: parsedKtp.rawText,
        senderName,
      };

      // Store in state awaiting confirmation
      await db
        .insert(telegramConversationStates)
        .values({
          chatId,
          step: "AWAITING_CONFIRMATION",
          tempData: fullData,
        })
        .onConflictDoUpdate({
          target: telegramConversationStates.chatId,
          set: {
            step: "AWAITING_CONFIRMATION",
            tempData: fullData,
          },
        });

      await sendConfirmationPrompt(chatId, fullData);
      return;
    }

    // Save OCR state and ask for the 4 supplemental fields
    const tempData = {
      nik: parsedKtp.nik || "",
      namaLengkap: parsedKtp.namaLengkap || "",
      jenisKelamin: parsedKtp.jenisKelamin,
      agama: parsedKtp.agama,
      pekerjaan: parsedKtp.pekerjaan,
      rt: parsedKtp.rt,
      rw: parsedKtp.rw,
      fotoKtpPath: localFilePath,
      ocrRawText: parsedKtp.rawText,
      senderName,
    };

    await db
      .insert(telegramConversationStates)
      .values({
        chatId,
        step: "AWAITING_SUPPLEMENTAL_DATA",
        tempData,
      })
      .onConflictDoUpdate({
        target: telegramConversationStates.chatId,
        set: {
          step: "AWAITING_SUPPLEMENTAL_DATA",
          tempData,
        },
      });

    await telegramBot.sendMessage(
      chatId,
      `🔍 *Hasil Ekstraksi OCR KTP:*\n` +
        `• *NIK:* \`${parsedKtp.nik || "(Gagal dibaca)"}\`\n` +
        `• *Nama Lengkap:* \`${parsedKtp.namaLengkap || "(Gagal dibaca)"}\`\n` +
        `• *Jenis Kelamin:* \`${parsedKtp.jenisKelamin}\`\n` +
        `• *Agama:* \`${parsedKtp.agama}\`\n` +
        `• *Pekerjaan:* \`${parsedKtp.pekerjaan}\`\n` +
        `• *RT / RW:* \`${parsedKtp.rt} / ${parsedKtp.rw}\`\n\n` +
        `📝 *Kirimkan 4 Data Pelengkap*\n` +
        `Balas pesan ini dengan format pemisah tanda pagar (\`#\`):\n` +
        `\`NO KK#NO HP#UNSUR PEMILIH#KATEGORI\`\n\n` +
        `*Contoh:* \n` +
        `\`3201012345670001#081234567890#PEMILIH TETAP (DPT)#PRIORITAS 1\`\n\n` +
        `_Ketik \`/batal\` jika ingin membatalkan._`
    );
  } catch (ocrError) {
    console.error("OCR extraction failed:", ocrError);
    await telegramBot.sendMessage(
      chatId,
      `⚠️ Terjadi kendala saat membaca foto KTP. Pastikan pencahayaan cukup dan foto tidak buram, lalu coba kirim ulang.`
    );
  }
}

/**
 * Handle text responses during conversational flow
 */
async function handleConversationText(chatId: string, text: string, senderName: string) {
  const stateRecord = await db
    .select()
    .from(telegramConversationStates)
    .where(eq(telegramConversationStates.chatId, chatId))
    .limit(1);

  if (stateRecord.length === 0) {
    await telegramBot.sendMessage(
      chatId,
      `Silakan kirimkan foto KTP untuk memulai entri data penduduk, atau ketik \`/bantuan\` untuk melihat instruksi.`
    );
    return;
  }

  const state = stateRecord[0];
  const tempData = (state.tempData as any) || {};

  if (state.step === "AWAITING_SUPPLEMENTAL_DATA") {
    // Parse the 4 fields: NO KK#NO HP#UNSUR PEMILIH#KATEGORI
    const parts = text.split(/[#\n]/).map((s) => s.trim());

    if (parts.length < 4) {
      await telegramBot.sendMessage(
        chatId,
        `⚠️ *Format belum lengkap!*\n` +
          `Pastikan mengirim 4 data dengan pemisah \`#\`:\n` +
          `\`NO KK#NO HP#UNSUR PEMILIH#KATEGORI\`\n\n` +
          `*Contoh:*\n` +
          `\`3201012345670001#081234567890#PEMILIH TETAP (DPT)#PRIORITAS 1\``
      );
      return;
    }

    const noKk = parts[0].replace(/[^0-9]/g, "");
    const noHp = parts[1];
    const unsurPemilih = parts[2];
    const kategori = parts[3];

    if (noKk.length !== 16) {
      await telegramBot.sendMessage(
        chatId,
        `⚠️ Nomor KK harus 16 digit angka. Nomor KK yang diterima: \`${noKk}\` (${noKk.length} digit).`
      );
      return;
    }

    // Combine all 11 columns
    const fullData = {
      ...tempData,
      noKk,
      noHp,
      unsurPemilih,
      kategori,
      senderName,
    };

    // Update state to AWAITING_CONFIRMATION
    await db
      .update(telegramConversationStates)
      .set({
        step: "AWAITING_CONFIRMATION",
        tempData: fullData,
      })
      .where(eq(telegramConversationStates.chatId, chatId));

    await sendConfirmationPrompt(chatId, fullData);
    return;
  }

  if (state.step === "AWAITING_CONFIRMATION") {
    await telegramBot.sendMessage(
      chatId,
      `Silakan gunakan tombol *[✅ Simpan ke Database]* atau *[❌ Batal]* di atas untuk melanjutkan.`
    );
  }
}

/**
 * Send preview of all 11 columns with Inline Keyboard
 */
async function sendConfirmationPrompt(chatId: string, data: any) {
  const summaryText =
    `📋 *Pratinjau Data Lengkap (11 Kolom Baku):*\n\n` +
    `1. *NIK:* \`${data.nik}\`\n` +
    `2. *NO KK:* \`${data.noKk}\`\n` +
    `3. *NO HP:* \`${data.noHp}\`\n` +
    `4. *Nama Lengkap:* *${data.namaLengkap}*\n` +
    `5. *Jenis Kelamin:* \`${data.jenisKelamin}\`\n` +
    `6. *Agama:* \`${data.agama}\`\n` +
    `7. *Pekerjaan:* \`${data.pekerjaan}\`\n` +
    `8. *RT:* \`${data.rt}\`\n` +
    `9. *RW:* \`${data.rw}\`\n` +
    `10. *Unsur Pemilih:* \`${data.unsurPemilih}\`\n` +
    `11. *Kategori:* \`${data.kategori}\`\n\n` +
    `_Apakah data di atas sudah sesuai?_`;

  await telegramBot.sendMessage(chatId, summaryText, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Simpan ke Database", callback_data: "save_resident" },
          { text: "❌ Batal", callback_data: "cancel_resident" },
        ],
      ],
    },
  });
}

/**
 * Handle Inline Button clicks
 */
async function handleCallbackQuery(callbackQuery: any) {
  const callbackId = callbackQuery.id;
  const chatId = String(callbackQuery.message?.chat?.id || "");
  const action = callbackQuery.data;

  if (action === "cancel_resident") {
    await db
      .delete(telegramConversationStates)
      .where(eq(telegramConversationStates.chatId, chatId));

    await telegramBot.answerCallbackQuery(callbackId, "Penyimpanan dibatalkan");
    await telegramBot.sendMessage(
      chatId,
      `❌ *Penyimpanan data dibatalkan.* Anda dapat mengirimkan foto KTP baru.`
    );
    return;
  }

  if (action === "save_resident") {
    const stateRecord = await db
      .select()
      .from(telegramConversationStates)
      .where(eq(telegramConversationStates.chatId, chatId))
      .limit(1);

    if (stateRecord.length === 0 || !stateRecord[0].tempData) {
      await telegramBot.answerCallbackQuery(callbackId, "Sesi tidak ditemukan atau kedaluwarsa");
      await telegramBot.sendMessage(
        chatId,
        `⚠️ Sesi input telah kedaluwarsa. Silakan kirim ulang foto KTP.`
      );
      return;
    }

    const data = stateRecord[0].tempData as any;

    // Check duplicate NIK
    const existing = await db
      .select()
      .from(residents)
      .where(eq(residents.nik, data.nik))
      .limit(1);

    if (existing.length > 0) {
      await telegramBot.answerCallbackQuery(callbackId, "NIK sudah terdaftar!");
      await telegramBot.sendMessage(
        chatId,
        `⚠️ *Gagal Menyimpan*: NIK \`${data.nik}\` sudah terdaftar dalam sistem atas nama *${existing[0].namaLengkap}*.`
      );
      await db
        .delete(telegramConversationStates)
        .where(eq(telegramConversationStates.chatId, chatId));
      return;
    }

    // Insert into residents table
    const residentId = crypto.randomUUID();
    const inserted = await db
      .insert(residents)
      .values({
        id: residentId,
        nik: data.nik,
        noKk: data.noKk,
        noHp: data.noHp,
        namaLengkap: data.namaLengkap,
        jenisKelamin: data.jenisKelamin,
        agama: data.agama,
        pekerjaan: data.pekerjaan,
        rt: data.rt,
        rw: data.rw,
        unsurPemilih: data.unsurPemilih,
        kategori: data.kategori,
        fotoKtpPath: data.fotoKtpPath ?? null,
        ocrRawText: data.ocrRawText ?? null,
        telegramChatId: chatId,
        telegramSenderName: data.senderName ?? "Petugas Telegram",
      })
      .returning();

    // Log Activity
    await db.insert(activityLogs).values({
      action: "BOT_UPLOAD",
      details: {
        residentId,
        nik: data.nik,
        namaLengkap: data.namaLengkap,
        chatId,
      },
    });

    // Clear state
    await db
      .delete(telegramConversationStates)
      .where(eq(telegramConversationStates.chatId, chatId));

    await telegramBot.answerCallbackQuery(callbackId, "Data berhasil disimpan!");

    // Instant Excel Generation & Immediate Delivery to Telegram Chat
    try {
      const excelBuffer = await generateResidentsExcel(
        inserted,
        `Input KTP ${data.nik}`
      );
      const filename = `data_ktp_${data.nik}.xlsx`;

      await telegramBot.sendDocument(
        chatId,
        excelBuffer,
        filename,
        `📄 *Berkas Dokumen Excel (.xlsx) Resmi*\nNIK: \`${data.nik}\` | Nama: *${data.namaLengkap}*`
      );
    } catch (excelError) {
      console.error("Failed to generate or send Excel file via bot:", excelError);
    }

    await telegramBot.sendMessage(
      chatId,
      `✅ *Data Berhasil Disimpan ke Basis Data Vectra!*\n\n` +
        `• *NIK:* \`${data.nik}\`\n` +
        `• *Nama:* *${data.namaLengkap}*\n` +
        `• *Wilayah:* RT ${data.rt} / RW ${data.rw}\n\n` +
        `File Excel (.xlsx) 11 kolom baku telah dikirimkan ke atas. Silakan kirim foto KTP berikutnya untuk melanjutkan.`
    );
  }
}
