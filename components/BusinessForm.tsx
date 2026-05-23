'use client'

import { BusinessObject } from '@/lib/agents'
import { NIGERIAN_CITIES, NIGERIAN_STATES } from '@/lib/nigeria-locations'

interface BusinessFormProps {
  value: BusinessObject
  onChange: (updated: BusinessObject) => void
}

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

export default function BusinessForm({ value, onChange }: BusinessFormProps) {
  function update<K extends keyof BusinessObject>(key: K, val: BusinessObject[K]) {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Restaurant name */}
      <Field label="Restaurant name">
        <input
          type="text"
          value={value.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Mama Cass, Yellow Chilli…"
          className="h-10 px-3 rounded-lg w-full transition-shadow duration-150"
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
          onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
        />
      </Field>

      {/* Category */}
      <Field label="Category">
        <input
          type="text"
          value={value.category}
          onChange={(e) => update('category', e.target.value)}
          placeholder="e.g. Nigerian, Seafood, Fast Food…"
          className="h-10 px-3 rounded-lg w-full transition-shadow duration-150"
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
          onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
        />
      </Field>

      {/* City + State */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="City">
          <input
            type="text"
            list="bf-city-list"
            value={value.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="Lagos"
            className="h-10 px-3 rounded-lg w-full transition-shadow duration-150"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
          />
          <datalist id="bf-city-list">
            {NIGERIAN_CITIES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Field>
        <Field label="State">
          <input
            type="text"
            list="bf-state-list"
            value={value.state}
            onChange={(e) => update('state', e.target.value)}
            placeholder="Lagos"
            className="h-10 px-3 rounded-lg w-full transition-shadow duration-150"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
          />
          <datalist id="bf-state-list">
            {NIGERIAN_STATES.map((s) => <option key={s} value={s} />)}
          </datalist>
        </Field>
      </div>

      {/* Star rating */}
      <Field label="Star rating">
        <div
          className="flex items-center gap-1 h-10 px-3 rounded-lg"
          style={{ border: '0.5px solid #D3D1C7', backgroundColor: '#fff' }}
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update('stars', s)}
              aria-label={`${s} stars`}
              className="transition-transform duration-100 hover:scale-110"
            >
              <svg width="22" height="22" viewBox="0 0 16 16" fill={value.stars >= s ? '#EF9F27' : '#e0ddd6'}>
                <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
              </svg>
            </button>
          ))}
          <span style={{ fontSize: '13px', color: '#8C8982', marginLeft: '6px' }}>
            {value.stars % 1 === 0 ? `${value.stars}.0` : value.stars.toFixed(1)}
          </span>
        </div>
      </Field>
    </div>
  )
}
