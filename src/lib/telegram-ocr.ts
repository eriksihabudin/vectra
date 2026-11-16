import sharp from "sharp";
import { createWorker } from "tesseract.js";

export interface ParsedKTP {
  nik: string | null;
  namaLengkap: string | null;
  jenisKelamin: "LAKI-LAKI" | "PEREMPUAN";
  agama: string;
  pekerjaan: string;
  rt: string;
  rw: string;
  rawText?: string;
}

export interface ParsedMetadata {
  noKk: string | null;
  noHp: string | null;
  unsurPemilih: string | null;
  kategori: string | null;
}

/**
 * Pre-process image using Sharp to optimize for Tesseract OCR:
 * - Grayscale
 * - Resize to standard high-clarity dimensions
 * - Enhance contrast (normalize)
 * - Sharpen edges
 */
export async function preprocessKTPImage(imageBuffer: Buffer): Promise<Buffer> {
  return await sharp(imageBuffer)
    .resize({ width: 1800, withoutEnlargement: false })
    .grayscale()
    .normalize()
    .sharpen()
    .toBuffer();
}

/**
 * Perform Optical Character Recognition (OCR) on image buffer
 */
export async function runKTPOcr(imageBuffer: Buffer): Promise<string> {
  try {
    const processed = await preprocessKTPImage(imageBuffer);
    const worker = await createWorker("ind+eng");
    const ret = await worker.recognize(processed);
    await worker.terminate();
    return ret.data.text;
  } catch (error) {
    console.error("Tesseract OCR fallback to basic processing:", error);
    try {
      const worker = await createWorker("eng");
      const ret = await worker.recognize(imageBuffer);
      await worker.terminate();
      return ret.data.text;
    } catch (fallbackError) {
      console.error("Tesseract OCR failed:", fallbackError);
      return "";
    }
  }
}

/**
 * Regex Parser Khusus KTP Indonesia (PRD Section 8.2)
 */
export function parseKTPText(ocrText: string): ParsedKTP {
  const clean = ocrText.replace(/\r/g, "").toUpperCase();

  // 1. Regex NIK: 16 digit angka (dengan toleransi typo N1K, NlK, dsb)
  const nikMatch = clean.match(/(?:NIK|N1K|NlK)?[\s:]*([1-9][0-9]{15})/);
  const nik = nikMatch ? nikMatch[1] : null;

  // 2. Regex Nama Lengkap
  const namaMatch = clean.match(/(?:NAMA|NAIVIA|NAHA)[\s:]+([A-Z\s.,'-]+)(?:\n|TEMPAT|TTL)/);
  let namaLengkap = namaMatch ? namaMatch[1].trim() : null;
  if (namaLengkap) {
    namaLengkap = namaLengkap.replace(/[^A-Z\s.,'-]/g, "").trim();
  }

  // 3. Regex Jenis Kelamin
  let jenisKelamin: "LAKI-LAKI" | "PEREMPUAN" = "LAKI-LAKI";
  if (clean.includes("PEREMPUAN") || clean.includes("WANITA")) {
    jenisKelamin = "PEREMPUAN";
  }

  // 4. Regex Agama
  const agamaMatch = clean.match(/(ISLAM|KRISTEN|KATOLIK|HINDU|BUDDHA|KONGHUCU)/);
  const agama = agamaMatch ? agamaMatch[1] : "ISLAM";

  // 5. Regex RT & RW
  const rtRwMatch = clean.match(/RT[\s.:]*([0-9]{1,3})[\s/]*RW[\s.:]*([0-9]{1,3})/);
  const rt = rtRwMatch ? rtRwMatch[1].padStart(3, "0") : "001";
  const rw = rtRwMatch ? rtRwMatch[2].padStart(3, "0") : "001";

  // 6. Regex Pekerjaan
  const kerjaMatch = clean.match(/PEKERJAAN[\s:]+([A-Z\s/]+)(?:\n|KEWARG|STATUS)/);
  let pekerjaan = kerjaMatch ? kerjaMatch[1].trim() : "BELUM/TIDAK BEKERJA";
  if (pekerjaan.length > 50) {
    pekerjaan = pekerjaan.substring(0, 50).trim();
  }

  return {
    nik,
    namaLengkap,
    jenisKelamin,
    agama,
    pekerjaan,
    rt,
    rw,
    rawText: ocrText,
  };
}

/**
 * Ekstraksi 4 field pelengkap dari teks/caption Telegram:
 * - NO KK
 * - NO HP
 * - UNSUR PEMILIH
 * - KATEGORI
 */
export function parseCaptionMetadata(caption: string): ParsedMetadata {
  if (!caption) {
    return { noKk: null, noHp: null, unsurPemilih: null, kategori: null };
  }

  const clean = caption.replace(/\r/g, "");

  // 1. NO KK: 16 digit angka
  const kkMatch = clean.match(/(?:NO\.?\s*KK|NOMOR\s*KK|KK)[\s:=]*([0-9]{16})/i) ||
                  clean.match(/\b([0-9]{16})\b/);
  const noKk = kkMatch ? kkMatch[1] : null;

  // 2. NO HP: digit Indonesia (08... atau 628...)
  const hpMatch = clean.match(/(?:NO\.?\s*HP|NO\.?\s*WA|TELP|HP|WHATSAPP)[\s:=]*([+0-9\s-]{9,16})/i) ||
                  clean.match(/\b(08[0-9]{8,12}|628[0-9]{8,12})\b/);
  const noHp = hpMatch ? hpMatch[1].replace(/[^0-9+]/g, "") : null;

  // 3. UNSUR PEMILIH
  let unsurPemilih: string | null = null;
  const upper = clean.toUpperCase();
  if (upper.includes("PEMILIH PEMULA")) {
    unsurPemilih = "PEMILIH PEMULA";
  } else if (upper.includes("LANSIA")) {
    unsurPemilih = "LANSIA";
  } else if (upper.includes("DISABILITAS")) {
    unsurPemilih = "DISABILITAS";
  } else if (upper.includes("TOKOH MASYARAKAT")) {
    unsurPemilih = "TOKOH MASYARAKAT";
  } else if (upper.includes("TNI") || upper.includes("POLRI") || upper.includes("PURNAWIRAWAN")) {
    unsurPemilih = "TNI/POLRI PURNAWIRAWAN";
  } else if (upper.includes("PENDATANG")) {
    unsurPemilih = "PENDATANG";
  } else if (upper.includes("DPT") || upper.includes("PEMILIH TETAP")) {
    unsurPemilih = "PEMILIH TETAP (DPT)";
  } else {
    const unsurMatch = clean.match(/(?:UNSUR\s*PEMILIH|UNSUR)[\s:=]*([^\n]+)/i);
    if (unsurMatch) {
      unsurPemilih = unsurMatch[1].trim();
    }
  }

  // 4. KATEGORI
  let kategori: string | null = null;
  if (upper.includes("PRIORITAS 1") || upper.includes("RING 1") || upper.includes("P1")) {
    kategori = "PRIORITAS 1";
  } else if (upper.includes("PRIORITAS 2") || upper.includes("RING 2") || upper.includes("P2")) {
    kategori = "PRIORITAS 2";
  } else if (upper.includes("BINAAN")) {
    kategori = "BINAAN";
  } else if (upper.includes("POTENSIAL")) {
    kategori = "POTENSIAL";
  } else if (upper.includes("UMUM")) {
    kategori = "UMUM";
  } else {
    const katMatch = clean.match(/(?:KATEGORI)[\s:=]*([^\n]+)/i);
    if (katMatch) {
      kategori = katMatch[1].trim();
    }
  }

  return {
    noKk,
    noHp,
    unsurPemilih,
    kategori,
  };
}

/**
 * Telegram API Helpers
 */
export async function sendTelegramMessage(
  token: string,
  chatId: string | number,
  text: string,
  replyMarkup?: Record<string, unknown>
) {
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not provided, skipping sendMessage");
    return null;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error sendTelegramMessage:", error);
    return null;
  }
}

export async function sendTelegramDocument(
  token: string,
  chatId: string | number,
  fileBuffer: Buffer,
  filename: string,
  caption?: string
) {
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not provided, skipping sendDocument");
    return null;
  }

  try {
    const formData = new FormData();
    formData.append("chat_id", String(chatId));
    if (caption) {
      formData.append("caption", caption);
      formData.append("parse_mode", "HTML");
    }

    const blob = new Blob([new Uint8Array(fileBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    formData.append("document", blob, filename);

    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (error) {
    console.error("Error sendTelegramDocument:", error);
    return null;
  }
}

export async function downloadTelegramFile(token: string, fileId: string): Promise<Buffer | null> {
  if (!token) return null;

  try {
    // 1. Get file path
    const fileRes = await fetch(
      `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
    );
    const fileData = await fileRes.json();
    if (!fileData.ok || !fileData.result?.file_path) {
      console.error("Failed to get file path from Telegram:", fileData);
      return null;
    }

    const filePath = fileData.result.file_path;
    // 2. Download file buffer
    const downloadRes = await fetch(
      `https://api.telegram.org/file/bot${token}/${filePath}`
    );
    const arrayBuffer = await downloadRes.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error downloading file from Telegram:", error);
    return null;
  }
}
