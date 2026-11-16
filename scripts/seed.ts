import { db } from "../src/lib/db";
import { residents, telegramWhitelistedUsers, activityLogs, user, account } from "../src/lib/db/schema";
import { auth } from "../src/lib/auth";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting Vectra Database Seeder...");

  // 1. Create or verify Admin User
  const existingAdmin = await db.select().from(user).where(eq(user.email, "admin@vectra.local")).limit(1);
  let adminId = "";
  if (existingAdmin.length === 0) {
    console.log("Creating default Admin user (admin@vectra.local)...");
    const adminUser = await auth.api.createUser({
      body: {
        email: "admin@vectra.local",
        password: "admin123456",
        name: "Administrator Utama",
        role: "admin",
      },
    });
    adminId = adminUser.user.id;
    console.log("✅ Admin user created with ID:", adminId);
  } else {
    adminId = existingAdmin[0].id;
    console.log("ℹ️ Admin user already exists:", adminId);
  }

  // 2. Create or verify Operator User
  const existingOperator = await db.select().from(user).where(eq(user.email, "operator@vectra.local")).limit(1);
  if (existingOperator.length === 0) {
    console.log("Creating default Operator user (operator@vectra.local)...");
    const opUser = await auth.api.createUser({
      body: {
        email: "operator@vectra.local",
        password: "operator123456",
        name: "Petugas Operator Lapangan",
        role: "user",
      },
    });
    console.log("✅ Operator user created with ID:", opUser.user.id);
  } else {
    console.log("ℹ️ Operator user already exists.");
  }

  // 3. Seed Telegram Whitelist
  console.log("Seeding Telegram Whitelist users...");
  const sampleWhitelists = [
    {
      id: crypto.randomUUID(),
      chatId: "123456789",
      username: "petugas_lapangan_1",
      fullName: "Ahmad Kurniawan",
      isActive: true,
      addedBy: adminId,
      createdAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      chatId: "987654321",
      username: "petugas_lapangan_2",
      fullName: "Siti Rahmawati",
      isActive: true,
      addedBy: adminId,
      createdAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      chatId: "555666777",
      username: "koordinator_lapangan",
      fullName: "Budi Santoso",
      isActive: true,
      addedBy: adminId,
      createdAt: new Date(),
    },
  ];

  for (const wl of sampleWhitelists) {
    const existing = await db
      .select()
      .from(telegramWhitelistedUsers)
      .where(eq(telegramWhitelistedUsers.chatId, wl.chatId))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(telegramWhitelistedUsers).values(wl);
    }
  }
  console.log("✅ Telegram Whitelist seeded.");

  // 4. Seed Sample Residents
  console.log("Seeding initial 25 resident records...");
  const sampleResidents = [
    {
      nik: "3201011504850001",
      noKk: "3201010101100001",
      noHp: "081234567890",
      namaLengkap: "BAMBANG SUDARMONO",
      jenisKelamin: "LAKI-LAKI",
      agama: "ISLAM",
      pekerjaan: "WIRASWASTA",
      rt: "001",
      rw: "001",
      unsurPemilih: "PEMILIH TETAP (DPT)",
      kategori: "PRIORITAS 1",
    },
    {
      nik: "3201015609870002",
      noKk: "3201010101100001",
      noHp: "081234567891",
      namaLengkap: "SITI AISYAH NURJANAH",
      jenisKelamin: "PEREMPUAN",
      agama: "ISLAM",
      pekerjaan: "IBU RUMAH TANGGA",
      rt: "001",
      rw: "001",
      unsurPemilih: "PEMILIH TETAP (DPT)",
      kategori: "PRIORITAS 1",
    },
    {
      nik: "3201012301050003",
      noKk: "3201010101100001",
      noHp: "081398765432",
      namaLengkap: "DIMAS ARYA PRATAMA",
      jenisKelamin: "LAKI-LAKI",
      agama: "ISLAM",
      pekerjaan: "PELAJAR/MAHASISWA",
      rt: "001",
      rw: "001",
      unsurPemilih: "PEMILIH PEMULA",
      kategori: "POTENSIAL",
    },
    {
      nik: "3201021203700004",
      noKk: "3201020202110002",
      noHp: "082155667788",
      namaLengkap: "YOHANES CHRISTIANTO",
      jenisKelamin: "LAKI-LAKI",
      agama: "KATOLIK",
      pekerjaan: "KARYAWAN SWASTA",
      rt: "002",
      rw: "001",
      unsurPemilih: "PEMILIH TETAP (DPT)",
      kategori: "PRIORITAS 2",
    },
    {
      nik: "3201025508730005",
      noKk: "3201020202110002",
      noHp: "082155667789",
      namaLengkap: "MARIA MAGDALENA SIREGAR",
      jenisKelamin: "PEREMPUAN",
      agama: "KATOLIK",
      pekerjaan: "GURU",
      rt: "002",
      rw: "001",
      unsurPemilih: "TOKOH MASYARAKAT",
      kategori: "BINAAN",
    },
    {
      nik: "3201031407600006",
      noKk: "3201030303120003",
      noHp: "085211223344",
      namaLengkap: "H. AHMAD FAUZI LUKMAN",
      jenisKelamin: "LAKI-LAKI",
      agama: "ISLAM",
      pekerjaan: "PENSIUNAN PNS",
      rt: "003",
      rw: "001",
      unsurPemilih: "LANSIA",
      kategori: "PRIORITAS 1",
    },
    {
      nik: "3201035811650007",
      noKk: "3201030303120003",
      noHp: "085211223345",
      namaLengkap: "HJ. FATIMAH AZ-ZAHRA",
      jenisKelamin: "PEREMPUAN",
      agama: "ISLAM",
      pekerjaan: "MENGURUS RUMAH TANGGA",
      rt: "003",
      rw: "001",
      unsurPemilih: "LANSIA",
      kategori: "PRIORITAS 1",
    },
    {
      nik: "3201042506820008",
      noKk: "3201040404130004",
      noHp: "087811992288",
      namaLengkap: "I WAYAN SUDIRTA",
      jenisKelamin: "LAKI-LAKI",
      agama: "HINDU",
      pekerjaan: "PEDAGANG",
      rt: "001",
      rw: "002",
      unsurPemilih: "PEMILIH TETAP (DPT)",
      kategori: "UMUM",
    },
    {
      nik: "3201046109840009",
      noKk: "3201040404130004",
      noHp: "087811992289",
      namaLengkap: "NI LUH PUTU DEWI",
      jenisKelamin: "PEREMPUAN",
      agama: "HINDU",
      pekerjaan: "KARYAWAN SWASTA",
      rt: "001",
      rw: "002",
      unsurPemilih: "PEMILIH TETAP (DPT)",
      kategori: "UMUM",
    },
    {
      nik: "3201051908900010",
      noKk: "3201050505140005",
      noHp: "081988776655",
      namaLengkap: "MICHAEL TANUWIDJAJA",
      jenisKelamin: "LAKI-LAKI",
      agama: "BUDDHA",
      pekerjaan: "WIRASWASTA",
      rt: "002",
      rw: "002",
      unsurPemilih: "PEMILIH TETAP (DPT)",
      kategori: "PRIORITAS 2",
    },
    {
      nik: "3201060304950011",
      noKk: "3201060606150006",
      noHp: "089677889900",
      namaLengkap: "AGUS SUPRIYADI",
      jenisKelamin: "LAKI-LAKI",
      agama: "ISLAM",
      pekerjaan: "BURUH HARIAN LEPAS",
      rt: "003",
      rw: "002",
      unsurPemilih: "DISABILITAS",
      kategori: "BINAAN",
    },
    {
      nik: "3201072210880012",
      noKk: "3201070707160007",
      noHp: "088212345678",
      namaLengkap: "KOLONEL (PURN) HENDRO WIJAYA",
      jenisKelamin: "LAKI-LAKI",
      agama: "ISLAM",
      pekerjaan: "PURNAWIRAWAN TNI",
      rt: "004",
      rw: "002",
      unsurPemilih: "TNI/POLRI PURNAWIRAWAN",
      kategori: "PRIORITAS 1",
    },
    {
      nik: "3201081112990013",
      noKk: "3201080808170008",
      noHp: "081299887766",
      namaLengkap: "ANITA RAHAYU",
      jenisKelamin: "PEREMPUAN",
      agama: "KRISTEN",
      pekerjaan: "PERAWAT",
      rt: "001",
      rw: "003",
      unsurPemilih: "PEMILIH TETAP (DPT)",
      kategori: "POTENSIAL",
    },
    {
      nik: "3201090406040014",
      noKk: "3201090909180009",
      noHp: "085712345678",
      namaLengkap: "RIZKY RAMADHAN",
      jenisKelamin: "LAKI-LAKI",
      agama: "ISLAM",
      pekerjaan: "PELAJAR/MAHASISWA",
      rt: "002",
      rw: "003",
      unsurPemilih: "PEMILIH PEMULA",
      kategori: "PRIORITAS 2",
    },
    {
      nik: "3201104505030015",
      noKk: "3201090909180009",
      noHp: "085712345679",
      namaLengkap: "NURUL HIDAYATI",
      jenisKelamin: "PEREMPUAN",
      agama: "ISLAM",
      pekerjaan: "KARYAWAN SWASTA",
      rt: "002",
      rw: "003",
      unsurPemilih: "PEMILIH PEMULA",
      kategori: "POTENSIAL",
    },
    {
      nik: "3201111802770016",
      noKk: "3201111111190010",
      noHp: "081344556677",
      namaLengkap: "SUKIRNO MANURUNG",
      jenisKelamin: "LAKI-LAKI",
      agama: "KRISTEN",
      pekerjaan: "SUPIR",
      rt: "003",
      rw: "003",
      unsurPemilih: "PENDATANG",
      kategori: "UMUM",
    },
    {
      nik: "3201122909810017",
      noKk: "3201121212200011",
      noHp: "081577889911",
      namaLengkap: "KARTIKA WULANDARI",
      jenisKelamin: "PEREMPUAN",
      agama: "ISLAM",
      pekerjaan: "BIDAN",
      rt: "004",
      rw: "003",
      unsurPemilih: "TOKOH MASYARAKAT",
      kategori: "PRIORITAS 1",
    },
    {
      nik: "3201131704750018",
      noKk: "3201131313210012",
      noHp: "082266778899",
      namaLengkap: "DEDI MULYADI",
      jenisKelamin: "LAKI-LAKI",
      agama: "ISLAM",
      pekerjaan: "PETANI/PEKEBUN",
      rt: "005",
      rw: "003",
      unsurPemilih: "PEMILIH TETAP (DPT)",
      kategori: "BINAAN",
    },
    {
      nik: "3201145308780019",
      noKk: "3201131313210012",
      noHp: "082266778800",
      namaLengkap: "ROHAYATI",
      jenisKelamin: "PEREMPUAN",
      agama: "ISLAM",
      pekerjaan: "PETANI/PEKEBUN",
      rt: "005",
      rw: "003",
      unsurPemilih: "PEMILIH TETAP (DPT)",
      kategori: "BINAAN",
    },
    {
      nik: "3201150811920020",
      noKk: "3201151515220013",
      noHp: "081299112233",
      namaLengkap: "ANDI SETIAWAN",
      jenisKelamin: "LAKI-LAKI",
      agama: "ISLAM",
      pekerjaan: "KARYAWAN BUMN",
      rt: "001",
      rw: "004",
      unsurPemilih: "PEMILIH TETAP (DPT)",
      kategori: "POTENSIAL",
    },
    {
      nik: "3201162406960021",
      noKk: "3201161616230014",
      noHp: "085811223344",
      namaLengkap: "EKO WAHYUDI",
      jenisKelamin: "LAKI-LAKI",
      agama: "ISLAM",
      pekerjaan: "KULI BANGUNAN",
      rt: "002",
      rw: "004",
      unsurPemilih: "DISABILITAS",
      kategori: "BINAAN",
    },
    {
      nik: "3201170707710022",
      noKk: "3201171717240015",
      noHp: "081733445566",
      namaLengkap: "TJIOE BIE LAN",
      jenisKelamin: "PEREMPUAN",
      agama: "KONGHUCU",
      pekerjaan: "WIRASWASTA",
      rt: "003",
      rw: "004",
      unsurPemilih: "PEMILIH TETAP (DPT)",
      kategori: "PRIORITAS 2",
    },
    {
      nik: "3201181503930023",
      noKk: "3201181818250016",
      noHp: "081822334455",
      namaLengkap: "FAJAR NUGROHO",
      jenisKelamin: "LAKI-LAKI",
      agama: "ISLAM",
      pekerjaan: "DOKTER",
      rt: "001",
      rw: "005",
      unsurPemilih: "TOKOH MASYARAKAT",
      kategori: "PRIORITAS 1",
    },
    {
      nik: "3201194208940024",
      noKk: "3201181818250016",
      noHp: "081822334456",
      namaLengkap: "DR. CLARA ANGGRAENI",
      jenisKelamin: "PEREMPUAN",
      agama: "KRISTEN",
      pekerjaan: "DOKTER GIGI",
      rt: "001",
      rw: "005",
      unsurPemilih: "TOKOH MASYARAKAT",
      kategori: "PRIORITAS 1",
    },
    {
      nik: "3201200101060025",
      noKk: "3201202020260017",
      noHp: "089533445566",
      namaLengkap: "MUHAMMAD ILHAM HAKIM",
      jenisKelamin: "LAKI-LAKI",
      agama: "ISLAM",
      pekerjaan: "PELAJAR/MAHASISWA",
      rt: "002",
      rw: "005",
      unsurPemilih: "PEMILIH PEMULA",
      kategori: "POTENSIAL",
    },
  ];

  let insertedCount = 0;
  for (const r of sampleResidents) {
    const existing = await db.select().from(residents).where(eq(residents.nik, r.nik)).limit(1);
    if (existing.length === 0) {
      await db.insert(residents).values({
        id: crypto.randomUUID(),
        ...r,
        createdByUserId: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      insertedCount++;
    }
  }

  // 5. Activity Log for Seeding
  await db.insert(activityLogs).values({
    id: crypto.randomUUID(),
    userId: adminId,
    action: "SYSTEM_INITIALIZE",
    details: JSON.stringify({ seededResidents: insertedCount, seededAt: new Date().toISOString() }),
    ipAddress: "127.0.0.1",
    createdAt: new Date(),
  });

  console.log(`🎉 Seeding completed! Inserted ${insertedCount} residents.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
