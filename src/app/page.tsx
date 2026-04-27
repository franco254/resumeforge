"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Sparkles, FileText, Target, Download, ChevronRight,
  CheckCircle, Star, Zap, Shield, TrendingUp, Users
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Resume Analyzer",
    desc: "Get an instant score and actionable improvements powered by GPT-4. Know exactly what's holding you back.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Target,
    title: "Job-Tailoring Engine",
    desc: "Paste any job description and watch your resume transform to match keywords, tone, and requirements.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    desc: "Instantly craft a personalized cover letter that complements your resume and speaks to the role.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: Download,
    title: "Perfect PDF Export",
    desc: "Download pixel-perfect, ATS-friendly PDFs. Every template is tested across 50+ ATS systems.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
];

const STATS = [
  { value: "93%", label: "ATS pass rate" },
  { value: "3×", label: "More interviews" },
  { value: "50K+", label: "Resumes built" },
  { value: "4.9★", label: "User rating" },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Software Engineer @ Google",
    body: "ResumeForge tailored my resume for each role. I went from 0 callbacks to 8 interviews in two weeks.",
    avatar: "SC",
    color: "bg-blue-500",
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager @ Stripe",
    body: "The AI analyzer told me exactly what was weak. Fixed it, applied, got an offer. Couldn't believe it.",
    avatar: "MJ",
    color: "bg-emerald-500",
  },
  {
    name: "Priya Patel",
    role: "UX Designer @ Airbnb",
    body: "The templates are stunning and ATS-friendly. The cover letter generator saved me hours every application.",
    avatar: "PP",
    color: "bg-purple-500",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    color: "border-surface-200",
    cta: "Get Started Free",
    ctaClass: "btn-forge-outline",
    features: [
      "2 resumes",
      "3 templates",
      "AI Analyzer (5/day)",
      "PDF export",
      "Basic cover letter",
    ],
    missing: ["Job tailoring", "All 5 templates", "Unlimited AI", "DOCX export", "Interview prep"],
  },
  {
    name: "Premium",
    price: "$12",
    period: "per month",
    color: "border-forge-500 ring-2 ring-forge-500",
    cta: "Start Premium",
    ctaClass: "btn-forge",
    badge: "Most Popular",
    features: [
      "Unlimited resumes",
      "All 5 templates",
      "Unlimited AI requests",
      "Job tailoring engine",
      "PDF + DOCX export",
      "Interview prep",
      "Priority support",
    ],
    missing: [],
  },
];

export default function LandingPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-forge-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-surface-900">ResumeForge</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-surface-600">
            <a href="#features" className="hover:text-surface-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-surface-900 transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-surface-900 transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn-forge-outline text-sm px-3 py-2 hidden sm:flex">
              Sign In
            </Link>
            <Link href="/dashboard" className="btn-forge text-sm px-4 py-2">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="mesh-bg pt-20 pb-32 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/90 border border-forge-200 text-forge-700 
                          text-xs font-medium px-3 py-1.5 rounded-full mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by GPT-4 · ATS-Optimized · Trusted by 50,000+ job seekers
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-surface-900 
                         leading-[1.05] tracking-tight mb-6">
            Your resume,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-600 to-emerald-500">
              supercharged
            </span>{" "}
            by AI
          </h1>

          <p className="text-xl text-surface-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Build an ATS-optimized resume in minutes. Get AI-powered analysis, 
            one-click job tailoring, and professional templates that actually get you hired.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link href="/dashboard" className="btn-forge text-base px-8 py-3.5 shadow-forge">
              Build My Resume Free
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard?tab=analyze" className="btn-forge-outline text-base px-8 py-3.5">
              <Star className="w-4 h-4 text-yellow-500" />
              Analyze Existing Resume
            </Link>
          </div>
          <p className="text-sm text-surface-500">No credit card required · Free forever</p>
        </div>

        {/* Stats row */}
        <div className="max-w-2xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-surface-200 
                        rounded-2xl overflow-hidden shadow-card">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white px-6 py-5 text-center">
              <div className="font-display font-bold text-3xl text-surface-900">{s.value}</div>
              <div className="text-sm text-surface-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl text-surface-900 mb-4">
              Everything you need to land the job
            </h2>
            <p className="text-lg text-surface-600 max-w-xl mx-auto">
              ResumeForge combines powerful AI with beautifully designed tools to give you an unfair advantage.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-hover bg-white border border-surface-200 rounded-2xl p-6 shadow-card">
                <div className={`w-12 h-12 ${f.bg} ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-xl text-surface-900 mb-2">{f.title}</h3>
                <p className="text-surface-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="mt-20 bg-gradient-to-r from-forge-600 to-forge-800 rounded-3xl p-10 text-white text-center">
            <h3 className="font-display font-bold text-3xl mb-2">Get hired in 3 steps</h3>
            <p className="text-forge-200 mb-10">From blank page to submitted application in under 20 minutes</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { n: "1", t: "Build or Upload", d: "Create from scratch or upload your existing resume" },
                { n: "2", t: "AI Optimize", d: "Our AI analyzes and rewrites for maximum impact" },
                { n: "3", t: "Apply & Win", d: "Export perfectly formatted, ATS-ready resume" },
              ].map((step) => (
                <div key={step.n} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center 
                                  font-display font-bold text-xl mb-4">
                    {step.n}
                  </div>
                  <div className="font-semibold text-lg mb-1">{step.t}</div>
                  <div className="text-forge-200 text-sm">{step.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-4 bg-surface-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-4xl text-surface-900 mb-4">
              Real people, real results
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white border border-surface-200 rounded-2xl p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center 
                                   text-white font-bold text-sm`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-surface-900 text-sm">{t.name}</div>
                    <div className="text-xs text-surface-500">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-surface-600 text-sm leading-relaxed">"{t.body}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-4xl text-surface-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-surface-600">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PLANS.map((plan) => (
              <div key={plan.name}
                   className={`relative border-2 rounded-2xl p-8 ${plan.color} bg-white`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-forge-600 text-white 
                                  text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div className="font-display font-bold text-2xl text-surface-900 mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display font-bold text-5xl text-surface-900">{plan.price}</span>
                  <span className="text-surface-500 text-sm">/{plan.period}</span>
                </div>
                <Link href="/dashboard" className={`w-full justify-center mb-8 ${plan.ctaClass}`}>
                  {plan.cta}
                </Link>
                <div className="space-y-3">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-surface-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                  {plan.missing.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-surface-400 line-through">
                      <div className="w-4 h-4 rounded-full border border-surface-300 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 mesh-bg">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl text-surface-900 mb-4">
            Your next job starts here
          </h2>
          <p className="text-surface-600 mb-8">
            Join thousands of professionals who've used ResumeForge to land their dream role.
          </p>
          <Link href="/dashboard" className="btn-forge text-base px-8 py-3.5 shadow-forge">
            Start Building Free
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-surface-900 text-surface-400 py-10 px-4 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-forge-600 rounded-md flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white font-display">ResumeForge</span>
        </div>
        <p className="mb-2">© {new Date().getFullYear()} ResumeForge. All rights reserved.</p>
        <div className="flex gap-6 justify-center">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
