# ⚡ ResumeForge — AI-Powered Resume Builder

> Build ATS-optimized resumes, get AI analysis, tailor for any job, and generate cover letters — all in one place.

![ResumeForge](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![AI Powered](https://img.shields.io/badge/AI-GPT--4%20%7C%20Claude%20%7C%20Groq-green)

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ 
- An API key from OpenAI, Anthropic, or Groq (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/resumeforge.git
cd resumeforge
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and add your API key:

```env
# Choose your AI provider
AI_PROVIDER=openai          # or: anthropic | groq

# Add the matching API key
OPENAI_API_KEY=sk-...       # https://platform.openai.com/api-keys
# ANTHROPIC_API_KEY=sk-ant-... # https://console.anthropic.com/
# GROQ_API_KEY=gsk_...      # https://console.groq.com/ (free!)
```

> **💡 Pro tip:** Groq is FREE and extremely fast. Create an account at console.groq.com and get an API key instantly.

### 3. Run

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
resumeforge/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles + Tailwind
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Resume management dashboard
│   │   ├── builder/
│   │   │   └── page.tsx               # Main resume editor (tabbed)
│   │   ├── analyze/
│   │   │   └── page.tsx               # AI resume analyzer
│   │   ├── cover-letter/
│   │   │   └── page.tsx               # Cover letter generator
│   │   └── api/
│   │       ├── analyze/route.ts        # POST: Analyze resume, return score
│   │       ├── tailor/route.ts         # POST: Tailor resume to job description
│   │       ├── rewrite-bullet/route.ts # POST: AI rewrite single bullet
│   │       ├── cover-letter/route.ts   # POST: Generate cover letter
│   │       └── interview-prep/route.ts # POST: Generate interview questions
│   ├── components/
│   │   ├── AppNav.tsx                  # Sticky navigation bar
│   │   └── resume/
│   │       ├── ResumeForm.tsx          # Full resume editor form
│   │       ├── ResumePreview.tsx       # Live preview (5 templates)
│   │       ├── TemplateSelector.tsx    # Template picker UI
│   │       ├── TailorModal.tsx         # Job tailoring wizard
│   │       └── InterviewPrepModal.tsx  # Interview question generator
│   ├── lib/
│   │   ├── ai-provider.ts             # AI abstraction (OpenAI/Anthropic/Groq)
│   │   └── utils.ts                   # Helpers, storage, formatting
│   ├── store/
│   │   └── resumeStore.ts             # Zustand global state + localStorage
│   └── types/
│       └── index.ts                   # All TypeScript types
├── .env.example                        # Environment variable template
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

---

## ✨ Features

### Free Tier
| Feature | Details |
|---------|---------|
| Resume Builder | Full form editor with sections |
| 2 Saved Resumes | Stored in localStorage |
| 3 Templates | Modern, Classic, Minimal |
| AI Analyzer | 5 requests/day |
| AI Bullet Rewriter | 5 requests/day |
| Cover Letter Generator | Basic |
| PDF Export | Via browser print |

### Premium Tier ($12/month)
| Feature | Details |
|---------|---------|
| Unlimited Resumes | No limit |
| All 5 Templates | + Executive, Creative |
| Unlimited AI | No daily cap |
| **Job Tailoring Engine** | Full resume rewrite for any job |
| **Interview Prep** | AI-generated questions from resume |
| DOCX Export | Word document download |
| Priority Support | — |

---

## 🤖 AI Provider Configuration

The app uses a single abstraction layer — swap providers with one env var:

```env
AI_PROVIDER=openai     # GPT-4o-mini (default, cheap, fast)
AI_PROVIDER=anthropic  # Claude Sonnet (best quality)
AI_PROVIDER=groq       # Llama 3.1 70B (free, fastest)
```

To change the model within a provider, edit `src/lib/ai-provider.ts`:

```typescript
// OpenAI: "gpt-4o-mini" → "gpt-4o" for best results
model: "gpt-4o",

// Anthropic: "claude-haiku-4-5-20251001" (cheap) → "claude-sonnet-4-20250514" (best)
model: "claude-sonnet-4-20250514",

// Groq: "llama-3.1-70b-versatile" → "mixtral-8x7b-32768"
model: "llama-3.1-70b-versatile",
```

---

## 💳 Adding Stripe for Premium Upgrades

The app has placeholder upgrade buttons. To wire up real payments:

### 1. Install Stripe
```bash
npm install stripe @stripe/stripe-js
```

### 2. Add to `.env.local`
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...
```

### 3. Create checkout API route
```typescript
// src/app/api/create-checkout/route.ts
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
  return Response.json({ url: session.url });
}
```

### 4. Replace the upgrade button in `AppNav.tsx`
```typescript
async function handleUpgrade() {
  const res = await fetch("/api/create-checkout", { method: "POST" });
  const { url } = await res.json();
  window.location.href = url;
}
```

---

## 🔐 Adding Authentication (Clerk)

```bash
npm install @clerk/nextjs
```

Add to `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Wrap `layout.tsx`:
```tsx
import { ClerkProvider } from "@clerk/nextjs";
export default function RootLayout({ children }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
```

---

## 🚢 Deploy to Vercel

### One-click deploy:
1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repository
3. Add environment variables in Vercel dashboard
4. Deploy ✅

### CLI deploy:
```bash
npm install -g vercel
vercel --prod
```

Add env vars:
```bash
vercel env add AI_PROVIDER
vercel env add OPENAI_API_KEY
```

---

## 🗺️ Roadmap

- [ ] LinkedIn import (parse profile)
- [ ] DOCX export (via docx.js)
- [ ] Resume version history
- [ ] Job application tracker
- [ ] Multi-language support
- [ ] Chrome extension for 1-click tailoring
- [ ] Supabase backend for cross-device sync
- [ ] Team / agency plan

---

## 🤝 Contributing

1. Fork → Feature branch → PR
2. Follow the existing TypeScript + Tailwind patterns
3. Test all AI features with your API key

---

## 📄 License

MIT — use freely, attribution appreciated.

---

Built with ❤️ using Next.js 15, Tailwind CSS, Zustand, and the magic of modern AI.
