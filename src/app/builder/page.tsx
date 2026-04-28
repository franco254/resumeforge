"use client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const BuilderContent = dynamic(() => import("./BuilderContent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-forge-500 animate-spin" />
    </div>
  ),
});

export default function BuilderPage() {
  return <BuilderContent />;
}
