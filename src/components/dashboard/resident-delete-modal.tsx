"use client";

import React, { useState } from "react";
import { Resident } from "@/types/resident";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteModalProps {
  resident: Resident | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (resident: Resident) => void;
}

export function ResidentDeleteModal({
  resident,
  isOpen,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !resident) return null;

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onConfirm(resident);
      setIsDeleting(false);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150">
      <div
        className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3.5">
          <div className="size-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground font-heading">
              Hapus Data Penduduk?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Berkas data penduduk dan rekam jejak
              audit yang terkait akan dihapus dari sistem.
            </p>
          </div>
        </div>

        {/* Info Detail Data Yang Akan Dihapus */}
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 space-y-1 text-xs">
          <p className="font-semibold text-foreground">
            {resident.namaLengkap}
          </p>
          <p className="font-mono text-muted-foreground">
            NIK: <span className="font-semibold text-foreground">{resident.nik}</span>
          </p>
          <p className="text-muted-foreground">
            Domisili: RT {resident.rt} / RW {resident.rw} • {resident.kategori}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs gap-1.5 font-semibold cursor-pointer shadow-xs"
          >
            <Trash2 className="size-3.5" />
            <span>{isDeleting ? "Menghapus..." : "Ya, Hapus Data"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
