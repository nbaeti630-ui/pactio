"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  Zap,
  ShieldCheck,
  Wallet,
  Activity,
  CheckCircle2,
  ArrowRight,
  Bot,
  Eye,
} from "lucide-react";

type Tone = "amber" | "cyan" | "emerald";

const tickerSteps = [
  { label: "Deposit locked", detail: "2,500 USDC held in escrow", tone: "amber" as Tone, Icon: Lock },
  { label: "AI verifying deliverable", detail: "Matching work against agreed terms", tone: "cyan" as Tone, Icon: Bot },
  { label: "Conditions met, funds auto-released", detail: "Reactive transaction fired on-chain", tone: "emerald" as Tone, Icon: CheckCircle2 },
];

const steps = [
  { no: "01", title: "Lock the funds", desc: "Client deposits USDC into a non-custodial Pactio escrow. Nobody can touch it mid-deal.", Icon: Lock },
  { no: "02", title: "AI verifies the work", desc: "Freelancer submits the deliverable, and an AI reviewer checks it against the agreed terms.", Icon: Bot },
  { no: "03", title: "Reactive auto-release", desc: "When conditions are met, a Rialo reactive transaction releases the funds automatically, or refunds.", Icon: Zap },
];

const capabilities = [
  { title: "Trustless by design", desc: "Funds sit in escrow logic, not in someone's wallet. No middleman can run off with the money.", Icon: ShieldCheck },
  { title: "AI deliverable review", desc: "Payment terms are matched against submitted work automatically before any release.", Icon: Sparkles },
  { title: "Reactive settlement", desc: "Native event and time triggers release funds the moment conditions clear, no fragile webhooks.", Icon: Zap },
  { title: "Non-custodial wallet", desc: "Every deal gets its own on-chain address. You stay in control from start to finish.", Icon: Wallet },
  { title: "On-chain transparency", desc: "Every lock, verification and release is traceable. No hidden ledgers.", Icon: Eye },
  { title: "Instant finality", desc: "Once released, settlement lands in seconds, not in 30-day payout cycles.", Icon: Activity },
];

const integrations = ["Rialo", "USDC", "Supabase", "OpenAI", "Next.js"];

const comparison = [
  { feature: "Funds held safely", traditional: "Depends on platform", manual: "No, pay and pray", pactio: "On-chain escrow" },
  { feature: "Release trigger", traditional: "Manual dispute team", manual: "Manual trust", pactio: "Reactive auto-release" },
  { feature: "Deliverable check", traditional: "Human, slow", manual: "None", pactio: "AI-verified" },
  { feature: "Fees", traditional: "10 to 20 percent", manual: "Zero but risky", pactio: "Minimal on-chain" },
  { feature: "Settlement", traditional: "Days to weeks", manual: "Whenever", pactio: "Seconds" },
];

function toneText(tone: Tone) {
  if (tone === "amber") return "text-amber-300";
  if (tone === "cyan") return "text-cyan-300";
  return "text-emerald-300";
}

function toneDot(tone: Tone) {
  if (tone === "amber") return "bg-amber-400";
  if (tone === "cyan") return "bg-cyan-400";
  return "bg-emerald-400";
}

const LandingPage = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % tickerSteps.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".pactio-reveal"));
    els.forEach((el) => el.classList.add("reveal-init"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative w-full overflow-hidden text-white">
      <section className="relative mx-auto flex max-w-5xl flex-col items-center px-5 pb-16 pt-16 text-center sm:pt-24">
        <div className="pactio-hero-orb" aria-hidden="true" />

        <span className="pactio-fade-up inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-medium text-emerald-200">
          <Zap className="h-3.5 w-3.5" />
          Built on Rialo, reactive escrow
        </span>

        <h1 className="pactio-fade-up pactio-d1 pactio-title-glow mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
          Escrow that{" "}
          <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
            releases itself
          </span>
        </h1>

        <p className="pactio-fade-up pactio-d2 mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
          Pactio locks freelance payments on-chain, lets AI verify the delivered
          work, and uses Rialo reactive transactions to release funds the instant
          the deal is done.
        </p>

        <div className="pactio-fade-up pactio-d3 mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard" className="pactio-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-emerald-950">
            Launch app
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#how" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10">
            How it works
          </Link>
        </div>

        <div className="pactio-fade-up pactio-d4 pactio-glass mt-14 w-full max-w-xl rounded-2xl p-5 text-left">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Live escrow</span>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              reactive
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {tickerSteps.map((s, i) => {
              const Icon = s.Icon;
              const isActive = i === active;
              return (
                <div key={s.label} className={isActive ? "flex items-center gap-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-3 shadow-[0_0_30px_-8px_rgba(16,185,129,0.6)] transition-all duration-500" : "flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 opacity-60 transition-all duration-500"}>
                  <span className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 " + toneText(s.tone)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white/90">{s.label}</p>
                    <p className="truncate text-xs text-white/50">{s.detail}</p>
                  </div>
                  <span className={"h-2 w-2 shrink-0 rounded-full " + (isActive ? toneDot(s.tone) : "bg-white/20")} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="pactio-reveal text-center text-3xl font-bold tracking-tight sm:text-4xl">From locked to released, automatically</h2>
        <p className="pactio-reveal mt-3 text-center text-white/50">Three steps. Zero chasing invoices.</p>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.Icon;
            return (
              <div key={s.no} className="pactio-reveal pactio-card rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-300/80">{s.no}</span>
                  <Icon className="h-5 w-5 text-emerald-300" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="pactio-reveal text-center text-3xl font-bold tracking-tight sm:text-4xl">Why Pactio</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => {
            const Icon = c.Icon;
            return (
              <div key={c.title} className="pactio-reveal pactio-card rounded-2xl p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 text-center">
        <p className="pactio-reveal text-xs font-semibold uppercase tracking-widest text-white/40">Powered by</p>
        <div className="pactio-reveal mt-6 flex flex-wrap items-center justify-center gap-3">
          {integrations.map((name) => (
            <span key={name} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70">{name}</span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="pactio-reveal text-center text-3xl font-bold tracking-tight sm:text-4xl">Pactio vs the old way</h2>
        <div className="pactio-reveal pactio-glass mt-10 overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="p-4 font-medium"></th>
                  <th className="p-4 font-medium">Traditional escrow</th>
                  <th className="p-4 font-medium">Manual freelance</th>
                  <th className="p-4 font-semibold text-emerald-300">Pactio</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-b border-white/5 last:border-0">
                    <td className="p-4 font-medium text-white/80">{row.feature}</td>
                    <td className="p-4 text-white/50">{row.traditional}</td>
                    <td className="p-4 text-white/50">{row.manual}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        {row.pactio}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20">
        <div className="pactio-reveal pactio-glass relative overflow-hidden rounded-3xl px-6 py-16 text-center">
          <div className="pactio-hero-orb" aria-hidden="true" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Get paid the moment the work is done</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">Stop chasing invoices and disputing platforms. Let the escrow release itself.</p>
          <Link href="/dashboard" className="pactio-cta mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-emerald-950">
            Launch Pactio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-5 py-12 text-center">
        <p className="text-lg font-bold">Pactio</p>
        <p className="mt-2 text-sm text-white/50">Reactive escrow for freelance deals, built on Rialo</p>
        <p className="mx-auto mt-4 max-w-md text-xs text-white/30">Demo build. Rialo on-chain integration is currently simulated while the public testnet and SDK roll out.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
