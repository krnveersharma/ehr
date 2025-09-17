'use client'
import { MODMED_CONFIG } from "@/lib/config";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router=useRouter()
  const linkClass = (href: string) => `px-3 py-2 rounded ${pathname === href ? "bg-black text-white" : "hover:bg-gray-100"}`;

    useEffect(() => {
    if ((!MODMED_CONFIG.apiKey || MODMED_CONFIG.apiKey.trim() === "")&&pathname!="config") {
      router.push("/config");
    }
  }, [router]);
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-semibold">EHR</Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/patient" className={linkClass("/patient")}>
              Patients
            </Link>
            <Link href="/appointments" className={linkClass("/appointments")}>
              Appointments
            </Link>
            <Link href="/encounter" className={linkClass("/encounter")}>
              Encounter
            </Link>
            <Link href="/config" className={linkClass("/config")}>
              Config
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
} 