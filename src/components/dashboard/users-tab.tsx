"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  Send,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UsersAndSystemTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [, setLoadingUsers] = useState(false);
  const [, setLoadingWhitelist] = useState(false);

  // New User Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"operator" | "admin">("operator");
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [userMsg, setUserMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Whitelist Form State
  const [newChatId, setNewChatId] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [isSubmittingWl, setIsSubmittingWl] = useState(false);
  const [wlMsg, setWlMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchWhitelist = async () => {
    setLoadingWhitelist(true);
    try {
      const res = await fetch("/api/whitelist");
      const data = await res.json();
      if (data.success) {
        setWhitelist(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch whitelist", e);
    } finally {
      setLoadingWhitelist(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchWhitelist();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg(null);
    setIsSubmittingUser(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUserMsg({ type: "success", text: "Pengguna baru berhasil dibuat!" });
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        fetchUsers();
      } else {
        setUserMsg({ type: "error", text: data.error || "Gagal membuat pengguna" });
      }
    } catch (err: unknown) {
      setUserMsg({ type: "error", text: (err as Error).message });
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleToggleBan = async (userId: string, currentBanned: boolean) => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          banned: !currentBanned,
          banReason: !currentBanned ? "Dinonaktifkan oleh Administrator" : null,
        }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    setWlMsg(null);
    setIsSubmittingWl(true);

    try {
      const res = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: newChatId,
          username: newUsername,
          fullName: newFullName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setWlMsg({ type: "success", text: "Chat ID Telegram berhasil ditambahkan ke Whitelist!" });
        setNewChatId("");
        setNewUsername("");
        setNewFullName("");
        fetchWhitelist();
      } else {
        setWlMsg({ type: "error", text: data.error || "Gagal menambahkan whitelist" });
      }
    } catch (err: unknown) {
      setWlMsg({ type: "error", text: (err as Error).message });
    } finally {
      setIsSubmittingWl(false);
    }
  };

  const handleDeleteWhitelist = async (id: string) => {
    try {
      const res = await fetch(`/api/whitelist?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchWhitelist();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Manajemen Akun Pengguna (RBAC) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create User Form */}
        <Card className="border border-border/80 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="size-4 text-primary" />
              Tambah Operator / Admin Baru
            </CardTitle>
            <CardDescription className="text-xs">
              Registrasi publik dinonaktifkan. Akun baru hanya dapat dibuat dari panel ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {userMsg && (
              <div
                className={`p-2.5 rounded-lg text-xs mb-3 flex items-center gap-1.5 ${
                  userMsg.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300"
                    : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-300"
                }`}
              >
                {userMsg.type === "success" ? <CheckCircle2 className="size-3.5" /> : <ShieldAlert className="size-3.5" />}
                {userMsg.text}
              </div>
            )}
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <Label className="text-xs font-medium">Nama Lengkap:</Label>
                <Input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Email Akun:</Label>
                <Input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="budi@vectra.local"
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Kata Sandi:</Label>
                <Input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Peran / Role Akses:</Label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background mt-1"
                >
                  <option value="operator">Operator Lapangan (Akses Input & Ekspor)</option>
                  <option value="admin">Administrator (Akses Penuh & Konfigurasi)</option>
                </select>
              </div>
              <Button
                type="submit"
                disabled={isSubmittingUser}
                className="w-full h-8 text-xs mt-2 bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
              >
                {isSubmittingUser ? "Menyimpan..." : "Daftarkan Pengguna"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User List Table */}
        <div className="lg:col-span-2">
          <Card className="border border-border/80 shadow-xs h-full flex flex-col">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  Daftar Pengguna Sistem ({users.length})
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchUsers} className="text-xs h-7">
                  <RotateCcw className="size-3 mr-1" />
                  Refresh
                </Button>
              </div>
              <CardDescription className="text-xs">
                Akun yang memiliki hak akses masuk ke Web Dashboard Vectra.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Nama</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Peran</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="py-2.5 font-medium text-foreground">{u.name}</td>
                      <td className="py-2.5 font-mono text-muted-foreground">{u.email}</td>
                      <td className="py-2.5">
                        <Badge
                          variant="outline"
                          className={
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300"
                              : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300"
                          }
                        >
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-2.5">
                        {u.banned ? (
                          <Badge variant="destructive" className="text-[10px]">
                            DIBLOKIR
                          </Badge>
                        ) : (
                          <span className="inline-flex items-center text-emerald-600 text-[11px] font-medium gap-1">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBan(u.id, u.banned)}
                          className="h-6 text-[11px] cursor-pointer"
                        >
                          {u.banned ? "Buka Blokir" : "Nonaktifkan"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2. Telegram Whitelist Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-border/80 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Send className="size-4 text-blue-500" />
              Tambah Whitelist Telegram
            </CardTitle>
            <CardDescription className="text-xs">
              Hanya Chat ID Telegram yang terdaftar di sini yang diizinkan mengunggah data via bot.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {wlMsg && (
              <div
                className={`p-2.5 rounded-lg text-xs mb-3 flex items-center gap-1.5 ${
                  wlMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                    : "bg-red-50 text-red-800 border border-red-300"
                }`}
              >
                {wlMsg.type === "success" ? <CheckCircle2 className="size-3.5" /> : <ShieldAlert className="size-3.5" />}
                {wlMsg.text}
              </div>
            )}
            <form onSubmit={handleAddWhitelist} className="space-y-3">
              <div>
                <Label className="text-xs font-medium">Telegram Chat ID (Numerik):</Label>
                <Input
                  required
                  value={newChatId}
                  onChange={(e) => setNewChatId(e.target.value)}
                  placeholder="misal: 123456789"
                  className="h-8 text-xs font-mono mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Username Telegram (opsional):</Label>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="@petugas_lapangan"
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Nama Petugas / Pos:</Label>
                <Input
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Koordinator Lapangan RW 002"
                  className="h-8 text-xs mt-1"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmittingWl}
                className="w-full h-8 text-xs mt-2 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                {isSubmittingWl ? "Menambahkan..." : "Simpan ke Whitelist"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Whitelist Table */}
        <div className="lg:col-span-2">
          <Card className="border border-border/80 shadow-xs h-full flex flex-col">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="size-4 text-emerald-600" />
                  Daftar Petugas Terotorisasi Telegram ({whitelist.length})
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchWhitelist} className="text-xs h-7">
                  <RotateCcw className="size-3 mr-1" />
                  Refresh
                </Button>
              </div>
              <CardDescription className="text-xs">
                Pencegahan bot abuse: update webhook dari Chat ID selain daftar ini otomatis ditolak (401 Unauthorized).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Chat ID</th>
                    <th className="pb-2 font-medium">Petugas</th>
                    <th className="pb-2 font-medium">Username</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {whitelist.map((wl) => (
                    <tr key={wl.id} className="hover:bg-muted/30">
                      <td className="py-2.5 font-mono font-bold text-foreground">{wl.chatId}</td>
                      <td className="py-2.5 font-medium text-foreground">{wl.fullName || "-"}</td>
                      <td className="py-2.5 text-muted-foreground">
                        {wl.username ? `@${wl.username}` : "-"}
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center text-emerald-600 text-[11px] font-medium gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Diizinkan
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWhitelist(wl.id)}
                          className="h-6 text-red-600 hover:text-red-700 hover:bg-red-50 text-[11px] cursor-pointer"
                        >
                          <Trash2 className="size-3 mr-1" />
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
