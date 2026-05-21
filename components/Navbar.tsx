'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/review-generator', label: 'Write a review' },
  { href: '/recommender', label: 'Find restaurants' },
]

function BukkaLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Fork SVG */}
      <svg
        width="18"
        height="22"
        viewBox="0 0 18 22"
        fill="none"
        aria-hidden="true"
      >
        {/* Three tines */}
        <line x1="4"  y1="1" x2="4"  y2="7.5" stroke="#D85A30" strokeWidth="1.9" strokeLinecap="round" />
        <line x1="9"  y1="1" x2="9"  y2="7.5" stroke="#D85A30" strokeWidth="1.9" strokeLinecap="round" />
        <line x1="14" y1="1" x2="14" y2="7.5" stroke="#D85A30" strokeWidth="1.9" strokeLinecap="round" />
        {/* Neck — tines curve into handle */}
        <path
          d="M4 7.5 C4 10.5 9 11.5 9 11.5 C9 11.5 14 10.5 14 7.5"
          stroke="#D85A30"
          strokeWidth="1.9"
          strokeLinecap="round"
          fill="none"
        />
        {/* Handle */}
        <line x1="9" y1="11.5" x2="9" y2="21" stroke="#D85A30" strokeWidth="1.9" strokeLinecap="round" />
      </svg>

      {/* Wordmark */}
      <span
        style={{
          fontSize: '18px',
          letterSpacing: '-0.3px',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        <span style={{ fontWeight: 900, color: '#2C2C2A' }}>Bukka</span>
        <span style={{ fontWeight: 900, color: '#D85A30' }}> AI</span>
      </span>
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: '#fff',
        borderBottom: '0.5px solid #e8e6e0',
        height: '60px',
      }}
    >
      <div
        className="flex items-center justify-between h-full mx-auto px-4 sm:px-6 "
        style={{ maxWidth: '1200px' }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center" style={{ textDecoration: 'none' }} aria-label="Bukka AI home">
          <BukkaLogo />
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-3 sm:gap-6">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="relative transition-colors duration-150"
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: isActive ? '#D85A30' : '#5F5E5A',
                  textDecoration: 'none',
                  paddingBottom: '2px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#2C2C2A'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#5F5E5A'
                }}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute inset-x-0 bottom-0"
                    style={{
                      height: '2px',
                      backgroundColor: '#D85A30',
                      borderRadius: '999px',
                    }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
