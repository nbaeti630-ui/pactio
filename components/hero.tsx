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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060b0a] text-[#e6e9ea]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,rgba(16,185,129,0.14),transparent_70%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-52 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 pb-24">
        <section className="flex flex-col items-center pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-medium text-emerald-300">
            <Zap className="h-3.5 w-3.5" />
            Built on Rialo, reactive escrow
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Escrow that{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              releases itself
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-[#9fb0ab] sm:text-lg">
            Pactio locks freelance payments on-chain, lets AI verify the delivered
            work, and uses Rialo reactive transactions to release funds the instant
            the deal is done.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-[#04120d] shadow-[0_0_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400"
            >
              Launch app
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-[#e6e9ea] transition hover:border-emerald-400/40 hover:bg-white/10"
            >
              How it works
            </Link>
          </div>

          <div className="mt-14 w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-medium uppercase tracking-widest text-[#7d918b]">
                Live escrow
              </span>
              <span className="flex items-center gap-2 text-xs text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                reactive
              </span>
            </div>

            <div className="mt-4 space-y-3 text-left">
              {tickerSteps.map((s, i) => {
                const Icon = s.Icon;
                const isActive = i === active;
                return (
                  <div
                    key={s.label}
                    className={
                      "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500 " +
                      (isActive
                        ? "border-emerald-400/30 bg-emerald-400/[0.06] opacity-100"
                        : "border-transparent opacity-40")
                    }
                  >
                    <Icon className={"h-5 w-5 shrink-0 " + toneText(s.tone)} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#e6e9ea]">{s.label}</p>
                      <p className="truncate font-mono text-xs text-[#7d918b]">{s.detail}</p>
                    </div>
                    <span
                      className={
                        "ml-auto h-2 w-2 shrink-0 rounded-full " +
                        (isActive ? toneDot(s.tone) : "bg-white/10")
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how" className="mt-28">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            From locked to released, automatically
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-[#9fb0ab]">
            Three steps. Zero chasing invoices.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {steps.map((s) => {
              const Icon = s.Icon;
              return (
                <div
                  key={s.no}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition hover:border-emerald-400/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-bold text-emerald-400/40 group-hover:text-emerald-400/70">
                      {s.no}
                    </span>
                    <Icon className="h-6 w-6 text-emerald-300" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-[#9fb0ab]">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-28">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Why Pactio</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c) => {
              const Icon = c.Icon;
              return (
                <div
                  key={c.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition hover:border-emerald-400/30 hover:bg-white/[0.05]"
                >
                  <div className="inline-flex rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-2.5">
                    <Icon className="h-5 w-5 text-emerald-300" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-[#9fb0ab]">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-24">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-[#7d918b]">
            Powered by
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {integrations.map((name) => (
              <span
                key={name}
                className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 font-mono text-sm text-[#c7d3cf]"
              >
                {name}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-28">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Pactio vs the old way</h2>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-white/[0.03] text-[#9fb0ab]">
                  <th className="px-5 py-4 font-medium"> </th>
                  <th className="px-5 py-4 font-medium">Traditional escrow</th>
                  <th className="px-5 py-4 font-medium">Manual freelance</th>
                  <th className="px-5 py-4 font-semibold text-emerald-300">Pactio</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-t border-white/10">
                    <td className="px-5 py-4 font-medium text-[#e6e9ea]">{row.feature}</td>
                    <td className="px-5 py-4 text-[#889b95]">{row.traditional}</td>
                    <td className="px-5 py-4 text-[#889b95]">{row.manual}</td>
                    <td className="px-5 py-4 font-medium text-emerald-300">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        {row.pactio}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-28">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-cyan-400/10 px-6 py-14 text-center">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(16,185,129,0.18),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-2xl font-bold sm:text-4xl">
                Get paid the moment the work is done
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-[#9fb0ab]">
                Stop chasing invoices and disputing platforms. Let the escrow release itself.
              </p>
              <Link
                href="/dashboard"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-7 py-3 text-sm font-semibold text-[#04120d] shadow-[0_0_30px_rgba(16,185,129,0.4)] transition hover:bg-emerald-400"
              >
                Launch Pactio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-20 border-t border-white/10 pt-8 text-center">
          <p className="text-sm font-semibold text-[#e6e9ea]">Pactio</p>
          <p className="mt-2 text-xs text-[#7d918b]">
            Reactive escrow for freelance deals, built on Rialo
          </p>
          <p className="mx-auto mt-3 max-w-md text-[11px] text-[#5f716b]">
            Demo build. Rialo on-chain integration is currently simulated while the
            public testnet and SDK roll out.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
