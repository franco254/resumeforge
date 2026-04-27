"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Zap, LayoutDashboard, FileText, Wand2, Mail,
  Crown, ChevronDown, Menu, X, TrendingUp
} from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/builder",   label: "Builder",   icon: FileText },
  { href: "/analyze",   label: "Analyzer",  icon: TrendingUp },
  { href: "/cover-letter", label: "Cover Letter", icon: Mail },
];

export function AppNav() {
  const pathname = usePathname();
  const { plan, setPlan, resumes } = useResumeStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPremium = plan === "premium";

  // Demo toggle for premium (in production, replace with Stripe/Clerk)
  const handleUpgrade = () => {
    setPlan("premium");
    alert("🎉 Demo: You've been upgraded to Premium! In production, this triggers a Stripe checkout.");
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-surface-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-forge-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-surface-900 hidden sm:block">
              ResumeForge
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "bg-forge-50 text-forge-700"
                    : "text-surface-600 hover:text-surface-900 hover:bg-surface-100"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Resume count chip */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-surface-500 bg-surface-100 
                            px-2.5 py-1 rounded-full">
              <FileText className="w-3 h-3" />
              {resumes.length} resume{resumes.length !== 1 ? "s" : ""}
            </div>

            {/* Plan badge / Upgrade */}
            {isPremium ? (
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 
                              text-white text-xs font-bold px-3 py-1 rounded-full">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                className="flex items-center gap-1.5 bg-gradient-to-r from-forge-600 to-forge-700
                           text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:from-forge-700 
                           hover:to-forge-800 transition-all shadow-sm"
              >
                <Crown className="w-3 h-3" />
                Upgrade
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-surface-100 bg-white px-4 py-3 space-y-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  pathname === href
                    ? "bg-forge-50 text-forge-700"
                    : "text-surface-600 hover:bg-surface-100"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
