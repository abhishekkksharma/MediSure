import React from 'react'

interface StarLoaderProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  inline?: boolean
}

const SIZE_MAP = {
  sm: { box: 'h-7 w-7 rounded-lg', star: 'h-4 w-4' },
  md: { box: 'h-12 w-12 rounded-2xl', star: 'h-7 w-7' },
  lg: { box: 'h-16 w-16 rounded-2xl', star: 'h-10 w-10' },
}

function EightPointStar({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M32 4L37.8 20.2L51.8 12.2L43.8 26.2L60 32L43.8 37.8L51.8 51.8L37.8 43.8L32 60L26.2 43.8L12.2 51.8L20.2 37.8L4 32L20.2 26.2L12.2 12.2L26.2 20.2L32 4Z" />
    </svg>
  )
}

export default function StarLoader({
  label,
  size = 'md',
  inline = false,
}: StarLoaderProps) {
  const dims = SIZE_MAP[size]

  if (inline) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#f5dced] text-white">
          <EightPointStar className="animate-star-loader h-3.5 w-3.5 text-white drop-shadow-2xs" />
        </span>
        {label && <span>{label}</span>}
      </span>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-6"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex items-center justify-center bg-[#f6e1ef] shadow-xs ${dims.box}`}
      >
        <EightPointStar
          className={`animate-star-loader text-white drop-shadow-xs ${dims.star}`}
        />
      </div>
      {label && (
        <p className="text-xs font-medium text-neutral-600">{label}</p>
      )}
    </div>
  )
}

