import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ==========================================
// 1. TABEL AUTENTIKASI (better-auth standard)
// ==========================================
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("operator"), // "admin" | "operator"
  banned: integer("banned", { mode: "boolean" }).notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    impersonatedBy: text("impersonated_by"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_session_user_id").on(table.userId),
    index("idx_session_token").on(table.token),
  ]
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_account_user_id").on(table.userId),
  ]
);

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// ==========================================
// 2. TABEL UTAMA: DATA KEPENDUDUKAN (residents)
// ==========================================
export const residents = sqliteTable(
  "residents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // 11 Atribut Baku Terurut Sesuai PRD
    nik: text("nik", { length: 16 }).notNull().unique(),
    noKk: text("no_kk", { length: 16 }).notNull(),
    noHp: text("no_hp", { length: 20 }).notNull(),
    namaLengkap: text("nama_lengkap", { length: 255 }).notNull(),
    jenisKelamin: text("jenis_kelamin", { length: 20 }).notNull(), // "LAKI-LAKI" | "PEREMPUAN"
    agama: text("agama", { length: 50 }).notNull(),
    pekerjaan: text("pekerjaan", { length: 100 }).notNull(),
    rt: text("rt", { length: 5 }).notNull(),
    rw: text("rw", { length: 5 }).notNull(),
    unsurPemilih: text("unsur_pemilih", { length: 100 }).notNull(),
    kategori: text("kategori", { length: 100 }).notNull(),

    // Atribut Pendukung & Audit Trail
    fotoKtpPath: text("foto_ktp_path"),
    ocrRawText: text("ocr_raw_text"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    telegramChatId: text("telegram_chat_id"),
    telegramSenderName: text("telegram_sender_name"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("idx_residents_nik").on(table.nik),
    index("idx_residents_no_kk").on(table.noKk),
    index("idx_residents_nama_lengkap").on(table.namaLengkap),
    index("idx_residents_rt_rw").on(table.rt, table.rw),
    index("idx_residents_unsur_pemilih").on(table.unsurPemilih),
    index("idx_residents_kategori").on(table.kategori),
    index("idx_residents_created_at").on(table.createdAt),
  ]
);

// ==========================================
// 3. TABEL BOT TELEGRAM & LOGGING
// ==========================================
export const telegramWhitelistedUsers = sqliteTable(
  "telegram_whitelisted_users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    chatId: text("chat_id").notNull().unique(),
    username: text("username"),
    fullName: text("full_name"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    addedBy: text("added_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("idx_tg_whitelist_chat_id").on(table.chatId),
  ]
);

export const telegramConversationStates = sqliteTable(
  "telegram_conversation_states",
  {
    chatId: text("chat_id").primaryKey(),
    step: text("step").notNull(), // e.g. "AWAITING_INPUT", "AWAITING_CONFIRMATION"
    tempData: text("temp_data", { mode: "json" }), // JSON penyimpanan sementara
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  }
);

export const activityLogs = sqliteTable(
  "activity_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(), // CREATE_RESIDENT, UPDATE_RESIDENT, DELETE_RESIDENT, EXPORT_XLSX, BOT_UPLOAD
    details: text("details", { mode: "json" }),
    ipAddress: text("ip_address"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_activity_logs_user_id").on(table.userId),
    index("idx_activity_logs_created_at").on(table.createdAt),
  ]
);

export type Resident = typeof residents.$inferSelect;
export type NewResident = typeof residents.$inferInsert;
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type TelegramWhitelistedUser = typeof telegramWhitelistedUsers.$inferSelect;
export type TelegramConversationState = typeof telegramConversationStates.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
