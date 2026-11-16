export interface TelegramSendMessageOptions {
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  reply_markup?: {
    inline_keyboard?: Array<Array<{ text: string; callback_data?: string; url?: string }>>;
    keyboard?: Array<Array<{ text: string }>>;
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
    remove_keyboard?: boolean;
  };
}

export class TelegramBotClient {
  private token: string;
  private baseUrl: string;

  constructor(token?: string) {
    this.token = token || process.env.TELEGRAM_BOT_TOKEN || "";
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  get isConfigured(): boolean {
    return Boolean(this.token && this.token.length > 5);
  }

  /**
   * Send text message to a chat
   */
  async sendMessage(
    chatId: string | number,
    text: string,
    options: TelegramSendMessageOptions = {}
  ) {
    if (!this.isConfigured) {
      console.warn("Telegram bot token is not configured. Message skipped:", text);
      return null;
    }

    const payload = {
      chat_id: chatId,
      text,
      parse_mode: options.parse_mode ?? "Markdown",
      reply_markup: options.reply_markup,
    };

    const res = await fetch(`${this.baseUrl}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return await res.json();
  }

  /**
   * Send document (.xlsx file, etc.) to a chat using multipart/form-data
   */
  async sendDocument(
    chatId: string | number,
    fileBuffer: Buffer,
    filename: string,
    caption?: string
  ) {
    if (!this.isConfigured) {
      console.warn("Telegram bot token is not configured. Document send skipped:", filename);
      return null;
    }

    const formData = new FormData();
    formData.append("chat_id", String(chatId));

    // Convert Buffer to Blob for standard FormData
    const blob = new Blob([new Uint8Array(fileBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    formData.append("document", blob, filename);

    if (caption) {
      formData.append("caption", caption);
      formData.append("parse_mode", "Markdown");
    }

    const res = await fetch(`${this.baseUrl}/sendDocument`, {
      method: "POST",
      body: formData,
    });

    return await res.json();
  }

  /**
   * Retrieve file metadata (file_path) from Telegram
   */
  async getFile(fileId: string): Promise<{ file_path?: string } | null> {
    if (!this.isConfigured) return null;

    const res = await fetch(`${this.baseUrl}/getFile?file_id=${encodeURIComponent(fileId)}`);
    const data = await res.json();
    if (data.ok && data.result) {
      return data.result;
    }
    return null;
  }

  /**
   * Download file binary buffer from Telegram servers
   */
  async downloadFile(filePath: string): Promise<Buffer | null> {
    if (!this.isConfigured) return null;

    const downloadUrl = `https://api.telegram.org/file/bot${this.token}/${filePath}`;
    const res = await fetch(downloadUrl);
    if (!res.ok) {
      throw new Error(`Failed to download file from Telegram: ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Acknowledge callback query from inline buttons
   */
  async answerCallbackQuery(callbackQueryId: string, text?: string) {
    if (!this.isConfigured) return null;

    const res = await fetch(`${this.baseUrl}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    });

    return await res.json();
  }
}

export const telegramBot = new TelegramBotClient();
