'use client'

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

const DOMAINS = [
  'Nightlife', 'Beauty & Spas', 'Shopping', 'Fitness & Instruction',
  'Health & Medical', 'Hotels & Travel', 'Arts & Entertainment', 'Fashion',
  'Skin Care', 'Hair Salons', 'Nail Salons', 'Massage', 'Day Spas',
  'Gyms', 'Active Life', 'Venues & Event Spaces', 'Event Planning & Services',
  'Pet Services', 'Flowers & Gifts', 'Music Venues', 'Art Galleries',
  'Jewelry', 'Tattoo', 'Yoga', 'Performing Arts', 'Cinema', 'Museums',
  'Dance Studios', 'Bookstores', 'Wedding Planning',
]

interface DomainSelectProps {
  value: string | null
  onChange: (val: string | null) => void
}

export default function DomainSelect({ value, onChange }: DomainSelectProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = DOMAINS.filter((d) =>
    d.toLowerCase().includes(query.toLowerCase())
  )

  function select(domain: string) {
    onChange(domain)
    setOpen(false)
    setQuery('')
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(null)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <div
        className="flex items-center h-10 px-3 rounded-lg transition-shadow duration-150 cursor-text"
        style={{
          border: `0.5px solid ${open ? '#D85A30' : '#D3D1C7'}`,
          backgroundColor: '#fff',
          boxShadow: open ? '0 0 0 2px #D85A30, 0 0 0 3px #fff' : 'none',
        }}
        onClick={() => !value && setOpen(true)}
      >
        {value ? (
          <>
            <span className="flex-1" style={{ fontSize: '14px', color: '#2C2C2A' }}>{value}</span>
            <button
              type="button"
              onClick={clear}
              aria-label="Clear domain"
              className="flex items-center justify-center rounded transition-colors duration-100"
              style={{ padding: '2px' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F4F0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X size={13} color="#8C8982" strokeWidth={1.5} />
            </button>
          </>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder="Search domains..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: '14px', color: '#2C2C2A' }}
          />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 w-full rounded-xl overflow-auto"
          style={{
            top: 'calc(100% + 4px)',
            border: '1px solid #DDD9CF',
            backgroundColor: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            maxHeight: '200px',
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: '13px', color: '#B0ADA6' }}>
              No matches
            </div>
          ) : (
            filtered.map((d) => (
              <button
                key={d}
                type="button"
                onMouseDown={() => select(d)}
                className="w-full text-left px-3 py-2 transition-colors duration-100"
                style={{ fontSize: '13px', color: '#2C2C2A' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F4F0')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {d}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
