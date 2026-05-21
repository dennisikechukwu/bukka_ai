'use client'

import Link from 'next/link'
import { Sparkles, PenLine, Search } from 'lucide-react'

export default function Home() {
  return (
    <div
      className="flex-1 flex flex-col items-center px-4 sm:px-6"
      style={{ paddingTop: '96px', paddingBottom: '96px' }}
    >
      <div className="flex flex-col items-center w-full" style={{ maxWidth: '640px' }}>

        {/* Pill tag */}
        <div
          className="flex items-center gap-1.5 mb-8 px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: '#FFF3EF',
            border: '0.5px solid #F5C4B3',
            fontSize: '12px',
            fontWeight: 400,
            color: '#993C1D',
          }}
        >
          <Sparkles size={13} strokeWidth={1.5} />
          Nigerian AI food agent
        </div>

        {/* Hero headline */}
        <h1
          className="text-center mb-4"
          style={{
            fontSize: '36px',
            fontWeight: 900,
            color: '#2C2C2A',
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
          }}
        >
          Your Naija food critic,
          <br />
          powered by AI
        </h1>

        {/* Subtext */}
        <p
          className="text-center mb-12"
          style={{
            fontSize: '16px',
            fontWeight: 400,
            color: '#8C8982',
            lineHeight: 1.65,
            maxWidth: '480px',
          }}
        >
          Get restaurant reviews written in authentic Nigerian voice — or find your next favourite spot.
        </p>

        {/* Entry cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
          <EntryCard
            href="/review-generator"
            icon={<PenLine size={22} color="#D85A30" strokeWidth={1.5} />}
            title="Write a review"
            description="Generate a Naija-voiced restaurant review from a custom persona. Expressive, blunt, or anywhere in between."
            accentColor="#D85A30"
          />
          <EntryCard
            href="/recommender"
            icon={<Search size={22} color="#2C2C2A" strokeWidth={1.5} />}
            title="Find restaurants"
            description="Tell the AI who you are and it will surface the spots most likely to vibe with your taste."
            accentColor="#2C2C2A"
          />
        </div>

        {/* Stat pills */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <StatPill label="2 AI agents" />
          <StatPill label="~2s response" />
          <StatPill label="Naija tone" coral />
        </div>
      </div>
    </div>
  )
}

function EntryCard({
  href,
  icon,
  title,
  description,
  accentColor,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  accentColor: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-3 p-6 rounded-xl transition-all duration-150"
      style={{
        border: '1px solid #DDD9CF',
        backgroundColor: '#fff',
        textDecoration: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#DDD9CF'
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
      }}
    >
      <div
        className="flex items-center justify-center rounded-lg"
        style={{ width: '40px', height: '40px', backgroundColor: '#F5F4F0' }}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#2C2C2A' }}>{title}</h2>
        <p style={{ fontSize: '13px', fontWeight: 400, color: '#6B6965', lineHeight: 1.65 }}>
          {description}
        </p>
      </div>
      <div
        className="flex items-center gap-1 mt-auto"
        style={{ fontSize: '13px', fontWeight: 700, color: accentColor }}
      >
        Get started
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M3 7h8M7.5 4l3.5 3-3.5 3"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  )
}

function StatPill({ label, coral }: { label: string; coral?: boolean }) {
  return (
    <span
      style={{
        fontSize: '12px',
        fontWeight: 400,
        padding: '5px 12px',
        borderRadius: '999px',
        backgroundColor: coral ? '#FFF3EF' : '#F5F4F0',
        color: coral ? '#993C1D' : '#5F5E5A',
        border: '0.5px solid',
        borderColor: coral ? '#F5C4B3' : '#e8e6e0',
      }}
    >
      {label}
    </span>
  )
}
