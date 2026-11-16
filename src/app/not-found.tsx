import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground text-center">
      <div className="space-y-3 max-w-md">
        <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
        <h2 className="text-lg font-semibold">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-muted-foreground">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button size="sm" className="gap-2 cursor-pointer">
              <Home className="size-4" />
              <span>Kembali ke Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
