interface LoadingSpinnerProps {
  text: string
}

export default function LoadingSpinner({ text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
        style={{ animation: 'spin 800ms linear infinite' }}
      >
        <circle cx="14" cy="14" r="11" stroke="#e8e6e0" strokeWidth="2.5" />
        <path
          d="M14 3a11 11 0 0 1 11 11"
          stroke="#D85A30"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span style={{ fontSize: '13px', color: '#8C8982', fontWeight: 400 }}>{text}</span>
    </div>
  )
}
