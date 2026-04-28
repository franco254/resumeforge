#!/bin/bash
# Run from: /sdcard/Download/resumeforge
echo "Applying final fixes..."

# Fix 1: builder/page.tsx - add "use client" for ssr:false
cat > src/app/builder/page.tsx << 'EOF'
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
EOF

# Fix 2: package.json - remove all unused packages (prevent future 404s, faster build)
cat > package.json << 'EOF'
{
  "name": "resumeforge",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.3.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.6.3",
    "tailwindcss": "^3.4.14",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "zustand": "^5.0.0",
    "react-dropzone": "^14.3.5",
    "lucide-react": "^0.460.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "uuid": "^10.0.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.7.7",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/uuid": "^10.0.0"
  }
}
EOF

# Push
git add -A
git commit -m "Fix: use client builder, clean package.json, Next.js 15.3.2"
git push

echo "✅ Done! Check Vercel now."
