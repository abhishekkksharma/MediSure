import React from 'react'
import Link from 'next/link'

const CARE_PILLARS = [
  {
    index: '01',
    title: 'AI Symptom Check',
    description:
      'Describe how you feel in plain language and receive calm, structured triage guidance with recommended specialists.',
    href: '/diagnosis',
    cta: 'Check symptoms',
    accent: 'bg-[#f6e2e9]',
  },
  {
    index: '02',
    title: 'Doctor Appointments',
    description:
      'Browse verified specialists across departments and reserve a consultation slot without the waiting-room friction.',
    href: '/appointments',
    cta: 'Book a visit',
    accent: 'bg-[#fdf4d7]',
  },
  {
    index: '03',
    title: 'Blood Donor Network',
    description:
      'Locate compatible blood-group donors by city and state and notify everyone nearby via instant email alerts.',
    href: '/blood-bank',
    cta: 'Find donors',
    accent: 'bg-[#ebe6f8]',
  },
]

const STEPS = [
  {
    step: 'Step 01',
    title: 'Share what you are experiencing',
    detail: 'Run a quick AI-guided symptom check or go straight to specialist search.',
  },
  {
    step: 'Step 02',
    title: 'Connect with the right care',
    detail: 'Pick an available doctor or search verified donors in your city and state.',
  },
  {
    step: 'Step 03',
    title: 'Act without delay',
    detail: 'Confirm your appointment or send emergency blood alerts in one click.',
  },
]

export default function HomeSections() {
  return (
    <div className="w-full bg-[#fafafa] text-[#262029]">
      {/* Core Services — Minimal 3-column editorial grid */}
      <section className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-14 md:py-28 lg:px-20">
        <div className="mb-12 flex flex-col justify-between gap-4 border-b border-[#ebe4ea] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d6c7f]">
              What MediSure Offers
            </p>
            <h2 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[#231d25] sm:text-4xl md:text-[42px]">
              Essential care,{' '}
              <span className="italic text-[#9c4667]">quietly</span> unified.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#5c505e]">
            Three focused tools built for clarity when health decisions cannot wait.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CARE_PILLARS.map((item) => (
            <Link
              key={item.index}
              href={item.href}
              className="group flex flex-col justify-between rounded-2xl border border-[#ece4eb] bg-white p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d8c4d4] hover:shadow-[0_14px_36px_rgba(68,32,60,0.06)] md:p-8"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-[#2b242c] ${item.accent}`}
                  >
                    {item.index}
                  </span>
                  <span className="text-xs text-[#8a798c] transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <h3 className="mt-7 font-serif text-2xl font-normal tracking-tight text-[#231d25]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5c505e]">
                  {item.description}
                </p>
              </div>

              <div className="mt-8 border-t border-[#f3edf2] pt-4">
                <span className="text-xs font-semibold tracking-wide text-[#2b242c] transition-colors group-hover:text-[#b4436c]">
                  {item.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works — Minimal hairline step row */}
      <section className="border-y border-[#ebe4ea] bg-white">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-14 md:py-24 lg:px-20">
          <div className="mb-10 max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d6c7f]">
              How It Works
            </p>
            <h2 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[#231d25] md:text-4xl">
              From first symptom to real{' '}
              <span className="italic">follow-through.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 divide-y divide-[#ebe4ea] md:grid-cols-3 md:divide-x md:divide-y-0">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="py-6 first:pt-0 last:pb-0 md:px-8 md:py-2 md:first:pl-0 md:last:pr-0"
              >
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#9c4667]">
                  {s.step}
                </span>
                <h3 className="mt-2.5 text-base font-semibold tracking-tight text-[#231d25]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5c505e]">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiet CTA Strip */}
      <section className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-14 md:py-24 lg:px-20">
        <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-[#ead9e3] bg-[#f6e2e9]/55 px-7 py-10 md:flex-row md:items-center md:px-12 md:py-14">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d5567]">
              Ready When You Are
            </p>
            <h2 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[#231d25] md:text-[38px]">
              Start a free checkup or reach donors{' '}
              <span className="italic">in minutes.</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/diagnosis"
              className="rounded-full bg-[#262029] px-6 py-3 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-[#3d3342]"
            >
              Start AI Checkup
            </Link>
            <Link
              href="/blood-bank"
              className="rounded-full border border-[#cbb7c3] bg-white px-6 py-3 text-xs font-semibold tracking-wide text-[#262029] transition-colors hover:border-[#262029]"
            >
              Emergency Blood Bank
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
