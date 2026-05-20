'use client'

import TagInput from '@/components/TagInput'
import { PersonaObject } from '@/lib/agents'

interface PersonaBuilderProps {
  value: PersonaObject
  onChange: (updated: PersonaObject) => void
}

const TONE_OPTIONS = ['expressive', 'blunt', 'formal', 'casual', 'sarcastic'] as const

const inputStyle = {
  border: '0.5px solid #D3D1C7',
  fontSize: '14px',
  color: '#2C2C2A',
  backgroundColor: '#fff',
  outline: 'none',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontSize: '12px', color: '#8C8982', fontWeight: 400 }}>{label}</label>
      {children}
    </div>
  )
}

export default function PersonaBuilder({ value, onChange }: PersonaBuilderProps) {
  const initials = value.name
    ? value.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?'

  function update<K extends keyof PersonaObject>(key: K, val: PersonaObject[K]) {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Avatar + Name row */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-full shrink-0 select-none"
          style={{
            width: '44px',
            height: '44px',
            backgroundColor: '#FAECE7',
            color: '#993C1D',
            fontSize: '14px',
            fontWeight: 700,
          }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <input
          type="text"
          value={value.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Persona name"
          className="flex-1 h-10 px-3 rounded-lg transition-shadow duration-150"
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
          onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
        />
      </div>

      {/* Bio */}
      <Field label="Bio">
        <textarea
          value={value.bio}
          onChange={(e) => update('bio', e.target.value)}
          placeholder="Brief description of this persona's food personality..."
          rows={3}
          className="px-3 py-2.5 rounded-lg resize-none transition-shadow duration-150"
          style={{ ...inputStyle, lineHeight: 1.65 }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
          onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
        />
      </Field>

      {/* Tone */}
      <Field label="Tone">
        <div className="relative">
          <select
            value={value.tone}
            onChange={(e) => update('tone', e.target.value as PersonaObject['tone'])}
            className="w-full h-10 pl-3 pr-8 rounded-lg appearance-none transition-shadow duration-150"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            {TONE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1l5 5 5-5"
              stroke="#8C8982"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Field>

      {/* Avg Star Rating */}
      <Field label="Avg. star rating">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '11px', color: '#B0ADA6' }}>1.0</span>
            <span
              style={{
                fontSize: '20px',
                color: '#2C2C2A',
                fontWeight: 700,
                letterSpacing: '-0.5px',
              }}
            >
              {value.avg_star_rating.toFixed(1)}
            </span>
            <span style={{ fontSize: '11px', color: '#B0ADA6' }}>5.0</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={0.1}
            value={value.avg_star_rating}
            onChange={(e) => update('avg_star_rating', parseFloat(e.target.value))}
            className="w-full"
            style={{ cursor: 'pointer' }}
          />
        </div>
      </Field>

      {/* Food Preferences */}
      <Field label="Food preferences">
        <TagInput
          tags={value.food_preferences}
          onChange={(tags) => update('food_preferences', tags)}
          placeholder="e.g. suya, jollof rice, pounded yam…"
        />
      </Field>
    </div>
  )
}
