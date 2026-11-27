'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'

export type PopupType = 'success' | 'error' | 'info' | 'warning'

export interface PopupAction {
  label: string
  href?: string
  onClick?: () => void
}

export interface PopupOptions {
  title?: string
  message: string
  details?: string
  type?: PopupType
  duration?: number
  action?: PopupAction
}

export interface PopupMessage {
  id: string
  title?: string
  message: string
  details?: string
  type: PopupType
  duration: number
  action?: PopupAction
}

interface PopupContextValue {
  showPopup: (options: PopupOptions | string) => string
  showSuccess: (
    message: string,
    options?: Omit<PopupOptions, 'message' | 'type'>
  ) => string
  showError: (
    message: string,
    options?: Omit<PopupOptions, 'message' | 'type'>
  ) => string
  showInfo: (
    message: string,
    options?: Omit<PopupOptions, 'message' | 'type'>
  ) => string
  showWarning: (
    message: string,
    options?: Omit<PopupOptions, 'message' | 'type'>
  ) => string
  dismissPopup: (id: string) => void
  clearPopups: () => void
}

const DEFAULT_DURATION_MS = 5000
const MAX_POPUPS = 5

const POPUP_STYLES: Record<
  PopupType,
  {
    container: string
    badge: string
    title: string
    text: string
    icon: string
  }
> = {
  success: {
    container: 'border-emerald-200 bg-white/95 shadow-emerald-950/5',
    badge: 'bg-emerald-100 text-emerald-700',
    title: 'text-emerald-950',
    text: 'text-emerald-800',
    icon: '✓',
  },
  error: {
    container: 'border-red-200 bg-white/95 shadow-red-950/5',
    badge: 'bg-red-100 text-red-700',
    title: 'text-red-950',
    text: 'text-red-700',
    icon: '!',
  },
  warning: {
    container: 'border-amber-200 bg-white/95 shadow-amber-950/5',
    badge: 'bg-amber-100 text-amber-800',
    title: 'text-amber-950',
    text: 'text-amber-800',
    icon: '!',
  },
  info: {
    container: 'border-neutral-200 bg-white/95 shadow-neutral-950/5',
    badge: 'bg-neutral-100 text-neutral-700',
    title: 'text-neutral-900',
    text: 'text-neutral-600',
    icon: 'i',
  },
}

const PopupContext = createContext<PopupContextValue | undefined>(undefined)

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const [popups, setPopups] = useState<PopupMessage[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const counterRef = useRef(0)

  const dismissPopup = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setPopups((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearPopups = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer))
    timersRef.current.clear()
    setPopups([])
  }, [])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const showPopup = useCallback(
    (input: PopupOptions | string): string => {
      const options: PopupOptions =
        typeof input === 'string' ? { message: input } : input

      counterRef.current += 1
      const id = `popup-${Date.now()}-${counterRef.current}`
      const type: PopupType = options.type || 'info'
      const duration =
        typeof options.duration === 'number'
          ? options.duration
          : DEFAULT_DURATION_MS

      const nextPopup: PopupMessage = {
        id,
        title: options.title,
        message: options.message,
        details: options.details,
        type,
        duration,
        action: options.action,
      }

      setPopups((prev) => {
        const trimmed = prev.slice(-(MAX_POPUPS - 1))
        return [...trimmed, nextPopup]
      })

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissPopup(id)
        }, duration)
        timersRef.current.set(id, timer)
      }

      return id
    },
    [dismissPopup]
  )

  const showSuccess = useCallback(
    (message: string, options?: Omit<PopupOptions, 'message' | 'type'>) =>
      showPopup({ ...options, message, type: 'success' }),
    [showPopup]
  )

  const showError = useCallback(
    (message: string, options?: Omit<PopupOptions, 'message' | 'type'>) =>
      showPopup({ ...options, message, type: 'error' }),
    [showPopup]
  )

  const showInfo = useCallback(
    (message: string, options?: Omit<PopupOptions, 'message' | 'type'>) =>
      showPopup({ ...options, message, type: 'info' }),
    [showPopup]
  )

  const showWarning = useCallback(
    (message: string, options?: Omit<PopupOptions, 'message' | 'type'>) =>
      showPopup({ ...options, message, type: 'warning' }),
    [showPopup]
  )

  const value: PopupContextValue = {
    showPopup,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismissPopup,
    clearPopups,
  }

  return (
    <PopupContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed left-4 right-4 top-20 z-50 flex flex-col gap-2.5 sm:left-auto sm:right-5 sm:w-full sm:max-w-sm"
        aria-live="polite"
        aria-atomic="false"
      >
        {popups.map((popup) => {
          const style = POPUP_STYLES[popup.type]
          return (
            <div
              key={popup.id}
              role={popup.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-3 overflow-hidden rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all ${style.container}`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${style.badge}`}
                aria-hidden="true"
              >
                {style.icon}
              </span>

              <div className="min-w-0 flex-1">
                {popup.title && (
                  <p className={`text-xs font-bold ${style.title}`}>
                    {popup.title}
                  </p>
                )}
                <p
                  className={`break-words text-xs font-medium ${style.title} ${
                    popup.title ? 'mt-0.5' : ''
                  }`}
                >
                  {popup.message}
                </p>
                {popup.details && (
                  <p className={`mt-1 break-words text-[11px] leading-relaxed ${style.text}`}>
                    {popup.details}
                  </p>
                )}
                {popup.action && (
                  <div className="mt-2">
                    {popup.action.href ? (
                      <Link
                        href={popup.action.href}
                        onClick={() => dismissPopup(popup.id)}
                        className="inline-flex text-[11px] font-bold underline underline-offset-2 hover:opacity-80"
                      >
                        {popup.action.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          popup.action?.onClick?.()
                          dismissPopup(popup.id)
                        }}
                        className="inline-flex text-[11px] font-bold underline underline-offset-2 hover:opacity-80"
                      >
                        {popup.action.label}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissPopup(popup.id)}
                className="shrink-0 rounded-lg p-1 text-xs leading-none text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </PopupContext.Provider>
  )
}

export function usePopup(): PopupContextValue {
  const context = useContext(PopupContext)
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider')
  }
  return context
}
