'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Header/Navbar'
import StarLoader from '@/components/Common/StarLoader'
import { useUser } from '@/context/userContext'
import { DEPARTMENT_LABELS, DepartmentName } from '@/types/doctor'

type UrgencyLevel = 'low' | 'moderate' | 'high' | 'emergency'

interface DiagnosisQA {
  question: string
  answer: string
}

interface FinalDiagnosis {
  department: DepartmentName
  possibleConditions: string[]
  summary: string
  recommendedAction: string
  urgencyLevel: UrgencyLevel
  extractedSymptoms: string[]
}

interface BookedAppointment {
  _id: string
  department: DepartmentName
  appointmentDate: string
  timeSlot: string
  status: string
  bookingType: string
  doctor?: {
    name?: string
    email?: string
    doctorProfile?: {
      specialization?: string
      consultationFee?: number
    }
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const QUICK_SYMPTOMS = [
  'Fever, chills, and body ache',
  'Sore throat, ear pain, and blocked nose',
  'Persistent headache and dizziness',
  'Itchy skin rash and redness',
  'Knee or lower back joint pain',
  'Chest tightness and shortness of breath',
]

const URGENCY_STYLES: Record<UrgencyLevel, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  moderate: 'bg-amber-50 text-amber-800 border-amber-200',
  high: 'bg-orange-50 text-orange-800 border-orange-200',
  emergency: 'bg-red-50 text-red-700 border-red-200',
}

export default function DiagnosisPage() {
  const { user, token } = useUser()
  const [step, setStep] = useState<'symptoms' | 'questions' | 'result'>('symptoms')
  const [symptoms, setSymptoms] = useState('')
  const [preliminaryNotes, setPreliminaryNotes] = useState('')
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('moderate')
  const [qaList, setQaList] = useState<DiagnosisQA[]>([])
  const [preferredDate, setPreferredDate] = useState('')
  const [autoBook, setAutoBook] = useState(true)

  const [finalDiagnosis, setFinalDiagnosis] = useState<FinalDiagnosis | null>(null)
  const [appointment, setAppointment] = useState<BookedAppointment | null>(null)
  const [bookingNote, setBookingNote] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyzeSymptoms = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!symptoms.trim()) {
      setError('Please describe your symptoms before continuing.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/diagnosis/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptoms.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to analyze symptoms.')
        setLoading(false)
        return
      }

      const questions: string[] = Array.isArray(data.questions) ? data.questions : []
      setPreliminaryNotes(data.preliminaryNotes || '')
      setUrgencyLevel(data.urgencyLevel || 'moderate')

      if (questions.length === 0 || data.needsFollowUp === false) {
        setQaList([])
        setStep('questions')
      } else {
        setQaList(questions.map((q) => ({ question: q, answer: '' })))
        setStep('questions')
      }
    } catch {
      setError('Unable to connect to the MediSure AI server.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (index: number, value: string) => {
    setQaList((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, answer: value } : item))
    )
  }

  const handleCompleteDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Please sign in as a patient to finalize diagnosis and book an appointment.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/diagnosis/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          qaHistory: qaList,
          autoBook,
          preferredDate: preferredDate || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to complete diagnosis.')
        setLoading(false)
        return
      }

      setFinalDiagnosis(data.diagnosis)
      setAppointment(data.appointment || null)
      setBookingNote(data.bookingNote || '')
      setStep('result')
    } catch {
      setError('Unable to reach the MediSure server.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('symptoms')
    setSymptoms('')
    setPreliminaryNotes('')
    setQaList([])
    setFinalDiagnosis(null)
    setAppointment(null)
    setBookingNote('')
    setError('')
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#fdf8fa] text-[#262029]">
      {/* Soft pastel top glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(ellipse_at_top,rgba(246,226,233,0.75),transparent_70%)]"
        aria-hidden="true"
      />
      <Navbar />

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-16 pt-24 md:pt-28">
        {/* Cute Warm Header */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#edd8e3] bg-white/85 px-3.5 py-1 text-[11px] font-semibold tracking-wide text-[#7a4b61] shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-[#fae78c] ring-2 ring-[#f3c95f]/40" />
            MediSure AI Care
          </span>
          <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-[#231d25] sm:text-4xl">
            How are you feeling <span className="italic text-[#b4436c]">today?</span>
          </h1>
          <p className="mt-1.5 text-xs text-[#6c5b6e] sm:text-sm">
            Share what&apos;s bothering you and we&apos;ll gently guide you to the right specialist.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
          {[
            { id: 'symptoms', label: '1. Symptoms' },
            { id: 'questions', label: '2. Follow-up' },
            { id: 'result', label: '3. Diagnosis & Booking' },
          ].map((s) => {
            const isCurrent = step === s.id
            return (
              <span
                key={s.id}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition ${
                  isCurrent
                    ? 'bg-[#262029] text-white shadow-xs'
                    : 'border border-[#ece0e8] bg-white/80 text-[#6e5e70]'
                }`}
              >
                {isCurrent && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#fae78c]" />
                )}
                {s.label}
              </span>
            )
          })}
        </div>

        <div className="rounded-3xl border border-[#efe0e9] bg-white/95 p-6 shadow-[0_18px_45px_rgba(88,42,76,0.07)] backdrop-blur-xs md:p-8">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              {error}{' '}
              {!user && (
                <Link href="/auth/login" className="ml-1 font-bold underline">
                  Sign in here
                </Link>
              )}
            </div>
          )}

          {step === 'symptoms' && (
            <form onSubmit={handleAnalyzeSymptoms} className="space-y-5">
              <div>
                <label
                  htmlFor="symptoms-input"
                  className="mb-2 flex items-center justify-between text-sm font-semibold text-[#231d25]"
                >
                  <span>Describe your symptoms</span>
                  <span className="text-[11px] font-normal text-[#8b778e]">
                    Takes ~30 seconds
                  </span>
                </label>
                <textarea
                  id="symptoms-input"
                  rows={4}
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Example: Sore throat, mild fever, and ear pain for the last 2 days..."
                  className="w-full rounded-2xl border border-[#eadce5] bg-[#fdf9fb] p-4 text-sm text-[#262029] outline-none transition placeholder:text-[#a290a5] focus:border-[#d89db5] focus:bg-white focus:ring-4 focus:ring-[#f6e2e9]/60"
                />
              </div>

              <div>
                <p className="mb-2.5 text-xs font-medium text-[#7b697e]">
                  Or pick a quick example:
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SYMPTOMS.map((item) => {
                    const selected = symptoms === item
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSymptoms(item)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                          selected
                            ? 'border-[#df9ab5] bg-[#fdf0f5] font-medium text-[#8a2d52]'
                            : 'border-[#eee2e9] bg-[#fcf8fa] text-[#4a3f4d] hover:border-[#e3bfd0] hover:bg-[#fdf2f6]'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#262029] py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(38,32,41,0.16)] transition hover:bg-[#3a313e] disabled:cursor-not-allowed disabled:opacity-75"
              >
                {loading ? (
                  <StarLoader inline label="Analyzing symptoms..." />
                ) : (
                  <>
                    {/* <span className="text-[#fae78c]" aria-hidden="true">✦</span> */}
                    <span>Continue</span>
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'questions' && (
            <form onSubmit={handleCompleteDiagnosis} className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
                <p className="text-xs leading-relaxed text-neutral-700">
                  {preliminaryNotes}
                </p>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase ${URGENCY_STYLES[urgencyLevel]}`}
                >
                  {urgencyLevel}
                </span>
              </div>

              {qaList.map((item, idx) => (
                <div key={idx}>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-800 md:text-sm">
                    {idx + 1}. {item.question}
                  </label>
                  <input
                    type="text"
                    required
                    value={item.answer}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    placeholder="Your answer..."
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:bg-white"
                  />
                </div>
              ))}

              <div className="grid grid-cols-1 gap-4 rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-700">
                    Preferred date (optional)
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-2 self-end pb-1.5">
                  <input
                    type="checkbox"
                    checked={autoBook}
                    onChange={(e) => setAutoBook(e.target.checked)}
                    className="h-4 w-4 rounded accent-neutral-900"
                  />
                  <span className="text-xs font-medium text-neutral-800">
                    Auto-book matching doctor
                  </span>
                </label>
              </div>

              {!user && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                  Sign in to finalize diagnosis and book a doctor.{' '}
                  <Link href="/auth/login" className="font-bold underline">
                    Sign in
                  </Link>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('symptoms')}
                  className="rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 items-center justify-center rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {loading ? (
                    <StarLoader inline label="Finalizing diagnosis..." />
                  ) : (
                    'Get Diagnosis & Book'
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'result' && finalDiagnosis && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Recommended Department
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-neutral-900">
                    {DEPARTMENT_LABELS[finalDiagnosis.department] || finalDiagnosis.department}
                  </h2>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase ${URGENCY_STYLES[finalDiagnosis.urgencyLevel]}`}
                >
                  {finalDiagnosis.urgencyLevel}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Summary
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-700">
                  {finalDiagnosis.summary}
                </p>
              </div>

              {finalDiagnosis.possibleConditions.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Possible Considerations
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {finalDiagnosis.possibleConditions.map((cond, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Next Step
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-700">
                  {finalDiagnosis.recommendedAction}
                </p>
              </div>

              {appointment ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-white">
                      Appointment {appointment.status}
                    </span>
                    <span className="text-xs font-medium text-emerald-900">
                      Booked via AI Diagnosis
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-emerald-950 sm:grid-cols-2">
                    <p>
                      <strong>Doctor:</strong> {appointment.doctor?.name || 'Assigned Specialist'}
                    </p>
                    <p>
                      <strong>Department:</strong>{' '}
                      {DEPARTMENT_LABELS[appointment.department] || appointment.department}
                    </p>
                    <p>
                      <strong>Date:</strong>{' '}
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Slot:</strong> {appointment.timeSlot}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-xs text-neutral-600">
                  {bookingNote || 'No appointment was booked automatically.'}{' '}
                  <Link href="/appointments" className="font-semibold text-neutral-900 underline">
                    Go to Appointments
                  </Link>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
                >
                  New Checkup
                </button>
                <Link
                  href="/appointments"
                  className="rounded-xl border border-neutral-200 px-5 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  View Appointments
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
