'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/review-generator', label: 'Write a review' },
  { href: '/recommender', label: 'Find restaurants' },
]

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
        className="flex items-center justify-between h-full mx-auto px-6"
        style={{ maxWidth: '1200px' }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Yelp AI Agent home">
          <Image
            src="/logo.png"
            alt="Yelp AI"
            width={110}
            height={40}
            style={{ objectFit: 'contain', objectPosition: 'left center' }}
            priority
          />
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-6">
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
