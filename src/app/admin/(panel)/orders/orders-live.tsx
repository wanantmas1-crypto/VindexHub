"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrdersLive() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { router.refresh(); return 30; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [router]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <span className="hidden sm:inline">Auto-refresh in {seconds}s</span>
      <Button type="button" variant="secondary" size="sm" onClick={() => { router.refresh(); setSeconds(30); }}>
        <RefreshCw className="h-4 w-4" /> Refresh
      </Button>
    </div>
  );
}