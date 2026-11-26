import React from 'react'
import Link from 'next/link'
import Navbar from '../Header/Navbar'

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#f29bb8]" fill="currentColor" aria-hidden="true">
        <path d="M12 1l2.2 6.8L21 5.6l-4.2 5.9L23 14l-6.8 1.5L18.4 22 12 17.8 5.6 22l2.2-6.5L1 14l6.2-2.5L3 5.6l6.8 2.2L12 1z" />
      </svg>
    ),
    text: 'Start with an AI symptom check. Anytime, anywhere.',
  },
  {
    icon: (
      <span
        className="inline-block h-4 w-4 rounded-full bg-gradient-to-br from-[#ffe28a] to-[#f4b958] shadow-[0_0_10px_rgba(244,185,88,0.65)]"
        aria-hidden="true"
      />
    ),
    text: 'Get matched with the right specialist doctor.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#c7b3f5]" fill="currentColor" aria-hidden="true">
        <path d="M12 2l1.8 6.2 5.7-3.1-3.1 5.7L22.6 12l-6.2 1.8 3.1 5.7-5.7-3.1L12 22.6l-1.8-6.2-5.7 3.1 3.1-5.7L1.4 12l6.2-1.8-3.1-5.7 5.7 3.1L12 2z" />
      </svg>
    ),
    text: 'Find matching blood donors for emergencies fast.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#f4a442]" fill="currentColor" aria-hidden="true">
        <path d="M12 2L14.6 9.4L22 12L14.6 14.6L12 22L9.4 14.6L2 12L9.4 9.4L12 2Z" />
      </svg>
    ),
    text: 'Ongoing care with a MediSure-verified doctor.',
  },
]

function Hero() {
  return (
    <main className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden  text-[#262029]">
      {/* Subtle radial glow in the center */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.22),transparent_62%)]"
        aria-hidden="true"
      />

      {/* Hero Copy Section */}
      <section className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center justify-between px-4 pb-8 pt-24 md:px-14 md:pb-10 md:pt-28 lg:px-20">
        <div className="relative mx-auto max-w-4xl text-center">
          {/* Top-left white starburst */}
          <svg
            viewBox="0 0 80 80"
            className="pointer-events-none absolute -left-4 -top-4 h-14 w-14 text-white/95 md:-left-16 md:-top-3 md:h-20 md:w-20"
            fill="none"
            aria-hidden="true"
          >
            {Array.from({ length: 12 }).map((_, idx) => (
              <line
                key={idx}
                x1="40"
                y1="40"
                x2="40"
                y2="6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                transform={`rotate(${idx * 30} 40 40)`}
              />
            ))}
          </svg>

          <h1 className="text-4xl font-normal leading-[1.16] tracking-[-0.02em] text-[#28222a] sm:text-5xl md:text-[62px]">
            Smart{' '}
            <span className="relative inline-block font-bold">
              Care,
              {/* Hand-drawn oval loop around "Care," */}
              <svg
                viewBox="0 0 180 88"
                fill="none"
                className="pointer-events-none absolute -inset-x-3 -inset-y-2 h-[122%] w-[116%] text-[#3a303c]"
                aria-hidden="true"
              >
                <path
                  d="M24 22C58 6 138 7 162 28C180 44 156 76 92 78C32 80 6 58 14 34C20 16 62 10 110 14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>{' '}
            <span className="font-bold">Guided</span> by
            <br />
            Doctors and{' '}
            <span className="relative inline-block font-bold">
              Delivered
              {/* Hand-drawn curved arrow under "Delivered" */}
              <svg
                viewBox="0 0 280 34"
                fill="none"
                className="pointer-events-none absolute -bottom-4 left-0 w-[125%] text-[#2e2730]"
                aria-hidden="true"
              >
                <path
                  d="M4 22C74 10 176 8 264 16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M251 8L267 16.5L252 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>{' '}
            to You
          </h1>

          {/* Bottom-right white splash accent */}
          <svg
            viewBox="0 0 64 64"
            className="pointer-events-none absolute -bottom-5 right-2 h-11 w-11 text-white md:-bottom-4 md:-right-6 md:h-14 md:w-14"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M32 4l4.5 14.5L51 11l-7.5 13.5L58 31l-14.5 4.5L51 50l-14.5-7.5L32 58l-4.5-15.5L13 50l7.5-14.5L6 31l14.5-6.5L13 11l14.5 7.5L32 4z" />
          </svg>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-[#433745] md:mt-8 md:text-[17px]">
            MediSure connects patients with AI-assisted diagnosis, verified doctors,
            and same-blood-group donors in moments that matter.
          </p>
        </div>

        {/* Center Illustration Stage */}
        <div className="relative mt-4 flex w-full max-w-5xl items-end justify-between px-2 pt-8 md:mt-2 md:h-[310px] md:px-6">
          {/* Left Character: Friendly Flat-Vector Doctor */}
          <div className="relative flex w-[38%] max-w-[290px] items-end justify-start">
            {/* Playful squiggle */}
            <svg
              viewBox="0 0 48 64"
              fill="none"
              className="absolute -top-6 left-4 h-12 w-10 text-[#342a36] md:-top-8 md:left-8 md:h-14"
              aria-hidden="true"
            >
              <path
                d="M14 54C10 42 26 36 22 28C18 20 8 28 16 34C24 40 34 26 24 14C20 9 14 7 10 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>

            <svg
              viewBox="0 0 260 250"
              className="h-auto w-full drop-shadow-sm"
              fill="none"
              aria-label="Doctor illustration"
            >
              {/* Doctor white coat body */}
              <path
                d="M52 250L68 152C72 132 88 122 110 122H154C178 122 194 134 200 156L218 250H52Z"
                fill="#FFFFFF"
              />
              {/* Coat lapel & inner teal scrub */}
              <path d="M112 122L134 176L154 122H112Z" fill="#DCECF2" />
              <path d="M104 122L126 178L114 188L94 140L104 122Z" fill="#EEF2F6" />
              <path d="M162 122L140 178L152 188L172 140L162 122Z" fill="#EEF2F6" />

              {/* Stethoscope */}
              <path
                d="M104 126C98 160 112 186 134 186C156 186 170 160 162 126"
                stroke="#3A363D"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path d="M134 186V208" stroke="#3A363D" strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="134" cy="216" r="10" fill="#E87A54" />
              <circle cx="134" cy="216" r="5" fill="#FFF3B0" />

              {/* Neck */}
              <rect x="120" y="102" width="26" height="24" rx="10" fill="#F6D5C3" />

              {/* Head */}
              <circle cx="133" cy="78" r="34" fill="#F8DEC9" />
              {/* Hair */}
              <path
                d="M99 74C99 48 118 36 138 38C158 40 168 54 167 74C160 62 148 56 133 56C118 56 107 62 99 74Z"
                fill="#443D48"
              />
              {/* Friendly face */}
              <circle cx="123" cy="79" r="2.8" fill="#2A242D" />
              <circle cx="145" cy="79" r="2.8" fill="#2A242D" />
              <circle cx="116" cy="87" r="4.5" fill="#F29F8F" fillOpacity="0.45" />
              <circle cx="151" cy="87" r="4.5" fill="#F29F8F" fillOpacity="0.45" />
              <path
                d="M126 91C130 96 138 96 142 91"
                stroke="#2A242D"
                strokeWidth="2.4"
                strokeLinecap="round"
              />

              {/* Medical badge on coat */}
              <rect x="162" y="168" width="24" height="18" rx="4" fill="#FAE78C" />
              <path d="M174 172V182M169 177H179" stroke="#28222A" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Center Yellow Circular CTA Badge */}
          <div className="relative z-20 mb-8 flex shrink-0 items-center justify-center md:mb-14">
            <Link
              href="/diagnosis"
              aria-label="Start AI Diagnosis"
              className="group relative flex h-24 w-24 items-center justify-center rounded-full bg-[#fae78c] shadow-[0_14px_30px_rgba(88,42,76,0.18)] transition-transform duration-300 hover:scale-105 md:h-28 md:w-28"
            >
              {/* Curved circular text */}
              <svg
                viewBox="0 0 120 120"
                className="h-full w-full transition-transform duration-700 group-hover:rotate-45"
                aria-hidden="true"
              >
                <defs>
                  <path
                    id="badgeCirclePath"
                    d="M 60, 60 m -41, 0 a 41,41 0 1,1 82,0 a 41,41 0 1,1 -82,0"
                  />
                </defs>
                <text
                  fill="#2b242c"
                  fontSize="9.2"
                  fontWeight="700"
                  letterSpacing="2.1"
                >
                  <textPath href="#badgeCirclePath" startOffset="2%">
                    START AI CHECKUP • START AI CHECKUP •
                  </textPath>
                </text>
              </svg>

              {/* Center Medical Cross + Pulse Icon */}
              <div className="absolute flex h-9 w-9 items-center justify-center rounded-full text-[#2b242c]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                  <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3z" />
                </svg>
              </div>
            </Link>
          </div>

          {/* Right Character: Patient & Emergency Care Illustration */}
          <div className="relative flex w-[38%] max-w-[290px] items-end justify-end">
            {/* Playful zig-zag squiggle */}
            <svg
              viewBox="0 0 48 56"
              fill="none"
              className="absolute -top-6 right-6 h-11 w-9 text-[#342a36] md:-top-8 md:right-10 md:h-12"
              aria-hidden="true"
            >
              <path
                d="M14 50L26 38L12 30L30 20L18 10L34 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <svg
              viewBox="0 0 260 250"
              className="h-auto w-full drop-shadow-sm"
              fill="none"
              aria-label="Patient and blood care illustration"
            >
              {/* Patient body */}
              <path
                d="M44 250L62 156C68 134 86 124 112 124H152C176 124 194 136 200 158L216 250H44Z"
                fill="#FFFFFF"
              />
              {/* Warm coral sweater / accent */}
              <path
                d="M66 156C72 136 88 124 112 124H152C174 124 190 136 196 156L176 250H84L66 156Z"
                fill="#E27D4A"
              />
              {/* Collar */}
              <path d="M112 124C120 138 144 138 152 124H112Z" fill="#FFFFFF" />

              {/* Floating Blood Drop / Heart Care Badge */}
              <circle cx="72" cy="126" r="22" fill="#FFFFFF" />
              <path
                d="M72 113C72 113 62 123 62 130C62 135.5 66.5 140 72 140C77.5 140 82 135.5 82 130C82 123 72 113 72 113Z"
                fill="#E25A53"
              />

              {/* Neck */}
              <rect x="119" y="102" width="26" height="24" rx="10" fill="#F6D5C3" />

              {/* Head */}
              <circle cx="132" cy="78" r="34" fill="#F8DEC9" />
              {/* Hair */}
              <path
                d="M96 84C94 54 114 36 136 38C158 40 172 58 168 88C164 70 154 58 134 56C116 55 104 64 96 84Z"
                fill="#E27D4A"
              />
              {/* Friendly face */}
              <circle cx="120" cy="79" r="2.8" fill="#2A242D" />
              <circle cx="141" cy="79" r="2.8" fill="#2A242D" />
              <circle cx="114" cy="87" r="4.5" fill="#F29F8F" fillOpacity="0.45" />
              <circle cx="147" cy="87" r="4.5" fill="#F29F8F" fillOpacity="0.45" />
              <path
                d="M123 91C127 96 135 96 139 91"
                stroke="#2A242D"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Bottom White Feature Bar */}
        <div className="relative z-20 w-full bg-white/95 shadow-[0_14px_40px_rgba(70,32,62,0.08)] backdrop-blur-sm">
          <div className="grid grid-cols-1 divide-y divide-[#ece4eb] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {FEATURES.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3.5 px-6 py-5 md:px-7 md:py-6"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {item.icon}
                </div>
                <p className="text-xs font-medium leading-relaxed text-[#38313a] md:text-[13px]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </main>
  )
}

export default Hero