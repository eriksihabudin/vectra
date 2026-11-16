import sharp from "sharp";
import { createWorker } from "tesseract.js";

export interface ParsedKTP {
  nik: string | null;
  namaLengkap: string | null;
  jenisKelamin: string;
  agama: string;
  pekerjaan: string;
  rt: string;
  rw: string;
  rawText: string;
}

/**
 * Preprocess image buffer using Sharp to optimize OCR extraction accuracy:
 * - Resize down if resolution exceeds 1600px width
 * - Convert to grayscale
 * - Auto-normalize contrast
 * - Sharpen edge boundaries
 */
export async function preprocessKtpImage(inputBuffer: Buffer): Promise<Buffer> {
  let pipeline = sharp(inputBuffer);
  const metadata = await pipeline.metadata();

  if (metadata.width && metadata.width > 1600) {
    pipeline = pipeline.resize({ width: 1600, withoutEnlargement: true });
  }

  return await pipeline
    .grayscale()
    .normalize()
    .sharpen()
    .toBuffer();
}

/**
 * Regex parser for Indonesian KTP with OCR typo tolerances
 */
export function parseKTPText(ocrText: string): ParsedKTP {
  // Normalize text: replace carriage returns and convert to uppercase
  const clean = ocrText.replace(/\r/g, "").toUpperCase();

  // 1. NIK Matcher: 16 digits
  // Fix common OCR typos in NIK line: 'O', 'D' -> '0', 'L', 'I' -> '1', 'B' -> '8'
  let nik: string | null = null;
  const nikLineMatch = clean.match(/(?:NIK|N1K|NlK|N[I1]K)[\s:._-]*([0-9OODIILB]{16})/i);
  if (nikLineMatch) {
    nik = nikLineMatch[1]
      .replace(/[OD]/g, "0")
      .replace(/[IL]/g, "1")
      .replace(/B/g, "8");
  } else {
    // Fallback: search for any standalone 16-digit number starting with 1-9
    const standaloneDigits = clean.match(/\b([1-9][0-9]{15})\b/);
    if (standaloneDigits) {
      nik = standaloneDigits[1];
    }
  }

  // 2. NAMA LENGKAP Matcher
  let namaLengkap: string | null = null;
  const namaMatch = clean.match(/NAMA[\s:._-]+([A-Z\s.,'-]+)(?:\n|TEMPAT|TGL|LAHIR)/);
  if (namaMatch && namaMatch[1].trim().length > 1) {
    namaLengkap = namaMatch[1].trim();
  } else {
    // Fallback: Check line following NAMA
    const lines = clean.split("\n");
    const nameIndex = lines.findIndex((l) => l.includes("NAMA"));
    if (nameIndex !== -1 && lines[nameIndex + 1]) {
      const candidate = lines[nameIndex + 1].replace(/[^A-Z\s]/g, "").trim();
      if (candidate.length > 2) {
        namaLengkap = candidate;
      }
    }
  }

  // 3. JENIS KELAMIN Matcher
  let jenisKelamin = "LAKI-LAKI";
  if (clean.includes("PEREMPUAN") || clean.includes("WANITA")) {
    jenisKelamin = "PEREMPUAN";
  }

  // 4. AGAMA Matcher
  let agama = "ISLAM";
  const agamaMatch = clean.match(/(ISLAM|KRISTEN|KATOLIK|HINDU|BUDDHA|KONGHUCU)/);
  if (agamaMatch) {
    agama = agamaMatch[1];
  } else if (clean.includes("KRISTEN")) {
    agama = "KRISTEN";
  } else if (clean.includes("KATOLIK")) {
    agama = "KATOLIK";
  }

  // 5. RT & RW Matcher
  // Handles Indonesian KTP standard format "RT/RW : 003/007" as well as "RT 003 RW 007"
  let rt = "001";
  let rw = "001";
  const rtRwSlashMatch = clean.match(/RT\s*\/\s*RW[\s.:]*([0-9]{1,3})\s*[\s/]\s*([0-9]{1,3})/);
  const rtRwSeparateMatch = clean.match(/RT[\s.:]*([0-9]{1,3})[\s/]*RW[\s.:]*([0-9]{1,3})/);

  if (rtRwSlashMatch) {
    rt = rtRwSlashMatch[1].padStart(3, "0");
    rw = rtRwSlashMatch[2].padStart(3, "0");
  } else if (rtRwSeparateMatch) {
    rt = rtRwSeparateMatch[1].padStart(3, "0");
    rw = rtRwSeparateMatch[2].padStart(3, "0");
  } else {
    const singleRt = clean.match(/RT[\s.:]*([0-9]{1,3})/);
    const singleRw = clean.match(/RW[\s.:]*([0-9]{1,3})/);
    if (singleRt) rt = singleRt[1].padStart(3, "0");
    if (singleRw) rw = singleRw[1].padStart(3, "0");
  }

  // 6. PEKERJAAN Matcher
  let pekerjaan = "WIRASWASTA";
  const kerjaMatch = clean.match(/PEKERJAAN[\s:._-]+([A-Z\s/]+)(?:\n|KEWARG|STATUS|BERLAKU)/);
  if (kerjaMatch && kerjaMatch[1].trim().length > 1) {
    pekerjaan = kerjaMatch[1].trim();
  } else if (clean.includes("PNS") || clean.includes("PEGAWAI NEGERI")) {
    pekerjaan = "PEGAWAI NEGERI SIPIL";
  } else if (clean.includes("KARYAWAN SWASTA")) {
    pekerjaan = "KARYAWAN SWASTA";
  } else if (clean.includes("PELAJAR") || clean.includes("MAHASISWA")) {
    pekerjaan = "PELAJAR/MAHASISWA";
  } else if (clean.includes("BELUM") || clean.includes("TIDAK BEKERJA")) {
    pekerjaan = "BELUM/TIDAK BEKERJA";
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
 * Perform OCR on image buffer and parse KTP fields
 */
export async function extractKtpFromImage(imageBuffer: Buffer): Promise<ParsedKTP> {
  const processedBuffer = await preprocessKtpImage(imageBuffer);

  const worker = await createWorker("ind", 1, {
    errorHandler: (err) => console.error("Tesseract worker error:", err),
  });

  try {
    const {
      data: { text },
    } = await worker.recognize(processedBuffer);
    return parseKTPText(text);
  } finally {
    await worker.terminate();
  }
}
