"use client";

import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";
import type { TemplateId } from "@/types";

const TEMPLATES: {
  id: TemplateId;
  label: string;
  desc: string;
  color: string;
  premium?: boolean;
}[] = [
  { id: "modern",    label: "Modern",    desc: "Two-column with blue accent",   color: "bg-forge-600" },
  { id: "classic",   label: "Classic",   desc: "Traditional single-column",     color: "bg-slate-600" },
  { id: "minimal",   label: "Minimal",   desc: "Ultra-clean typography",        color: "bg-emerald-600" },
  { id: "executive", label: "Executive", desc: "Dark header, corporate feel",   color: "bg-zinc-800",   premium: true },
  { id: "creative",  label: "Creative",  desc: "Bold purple, modern layout",    color: "bg-purple-600", premium: true },
];

interface TemplateSelectorProps {
  selected: TemplateId;
  isPremium: boolean;
  onSelect: (id: TemplateId) => void;
}

export function TemplateSelector({ selected, isPremium, onSelect }: TemplateSelectorProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {TEMPLATES.map((tpl) => {
        const locked = tpl.premium && !isPremium;
        return (
          <button
            key={tpl.id}
            onClick={() => !locked && onSelect(tpl.id)}
            disabled={locked}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all shrink-0 w-28",
              selected === tpl.id
                ? "border-forge-500 bg-forge-50"
                : "border-surface-200 bg-white hover:border-surface-300",
              locked && "opacity-60 cursor-not-allowed"
            )}
          >
            {/* Mini resume mockup */}
            <div className={cn("w-16 h-20 rounded-md overflow-hidden border border-surface-200 relative", "bg-white")}>
              <div className={cn("h-5 w-full", tpl.color)} />
              <div className="p-1.5 space-y-1">
                <div className="h-1 bg-surface-200 rounded w-3/4" />
                <div className="h-1 bg-surface-100 rounded w-1/2" />
                <div className="h-1 bg-surface-100 rounded w-2/3" />
                <div className="h-1 bg-surface-100 rounded w-1/2" />
              </div>
              {locked && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-yellow-500" />
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-surface-800 flex items-center gap-1 justify-center">
                {tpl.label}
                {locked && <Crown className="w-3 h-3 text-yellow-500" />}
              </div>
              <div className="text-xs text-surface-400 leading-tight">{tpl.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
