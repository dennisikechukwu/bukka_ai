'use client'

import { useRef, useState } from 'react'
import { UploadCloud, X, UtensilsCrossed } from 'lucide-react'
import { BusinessObject } from '@/lib/agents'

interface BusinessFormProps {
  value: BusinessObject
  onChange: (updated: BusinessObject) => void
}

const PRICE_OPTIONS = ['$', '$$', '$$$', '$$$$'] as const

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

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ fontSize: '14px', color: '#2C2C2A' }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative inline-flex items-center rounded-full transition-colors duration-200"
        style={{
          width: '40px',
          height: '22px',
          backgroundColor: value ? '#D85A30' : '#D3D1C7',
          padding: '2px',
          flexShrink: 0,
        }}
        role="switch"
        aria-checked={value}
        aria-label={label}
      >
        <span
          className="inline-block rounded-full bg-white transition-transform duration-200"
          style={{
            width: '18px',
            height: '18px',
            transform: value ? 'translateX(18px)' : 'translateX(0)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          }}
        />
      </button>
    </div>
  )
}

function PhotoUpload() {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setPreview(URL.createObjectURL(file))
    setFileName(file.name)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    setPreview(null)
    setFileName(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const active = isDragging || isHovered

  return (
    <div className="flex flex-col gap-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleChange}
        aria-label="Upload restaurant photo"
      />

      {/* Upload zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative overflow-hidden w-full transition-all duration-200"
        style={{
          height: '140px',
          borderRadius: '10px',
          border: `1px dashed ${isDragging ? '#D85A30' : active ? '#B0ADA6' : '#D3D1C7'}`,
          backgroundColor: isDragging ? '#FFF3EF' : '#FAFAF8',
          cursor: 'pointer',
        }}
        aria-label="Upload restaurant photo"
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Restaurant preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Hover overlay */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity duration-200"
              style={{
                backgroundColor: 'rgba(0,0,0,0.45)',
                opacity: active ? 1 : 0,
              }}
            >
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors duration-150"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <X size={12} strokeWidth={2.5} />
                Remove photo
              </button>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                or click to replace
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 h-full px-4">
            <div
              className="flex items-center justify-center rounded-full transition-colors duration-200"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: isDragging ? '#FFF3EF' : '#F0EFEB',
                border: `1px solid ${isDragging ? '#F5C4B3' : '#e8e6e0'}`,
              }}
            >
              <UploadCloud
                size={18}
                strokeWidth={1.5}
                color={isDragging ? '#D85A30' : '#8C8982'}
              />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#2C2C2A' }}>
                {isDragging ? 'Drop to upload' : 'Add a restaurant photo'}
              </span>
              <span style={{ fontSize: '11px', color: '#B0ADA6', lineHeight: 1.5 }}>
                Drag & drop or{' '}
                <span style={{ color: '#D85A30', fontWeight: 700 }}>browse</span>
                {' '}— JPG, PNG, WebP
              </span>
            </div>
          </div>
        )}
      </div>

      {/* File name strip when uploaded */}
      {fileName && !isDragging && (
        <div
          className="flex items-center justify-between px-3 py-2 rounded-b-lg"
          style={{
            backgroundColor: '#F5F4F0',
            borderLeft: '1px solid #DDD9CF',
            borderRight: '1px solid #DDD9CF',
            borderBottom: '1px solid #DDD9CF',
            marginTop: '-2px',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <UtensilsCrossed size={12} color="#8C8982" strokeWidth={1.5} />
            <span
              className="truncate"
              style={{ fontSize: '11px', color: '#8C8982', fontWeight: 400 }}
            >
              {fileName}
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              color: '#27500A',
              backgroundColor: '#EAF3DE',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 400,
              flexShrink: 0,
            }}
          >
            Uploaded
          </span>
        </div>
      )}
    </div>
  )
}

export default function BusinessForm({ value, onChange }: BusinessFormProps) {
  function update<K extends keyof BusinessObject>(key: K, val: BusinessObject[K]) {
    onChange({ ...value, [key]: val })
  }

  function updateAttr<K extends keyof BusinessObject['attributes']>(
    key: K,
    val: BusinessObject['attributes'][K]
  ) {
    onChange({ ...value, attributes: { ...value.attributes, [key]: val } })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Restaurant photo upload */}
      <PhotoUpload />

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
            value={value.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="Lagos"
            className="h-10 px-3 rounded-lg w-full transition-shadow duration-150"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
          />
        </Field>
        <Field label="State">
          <input
            type="text"
            value={value.state}
            onChange={(e) => update('state', e.target.value)}
            placeholder="LA"
            className="h-10 px-3 rounded-lg w-full transition-shadow duration-150"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
          />
        </Field>
      </div>

      {/* Yelp Stars */}
      <Field label="Yelp stars (1–5)">
        <input
          type="number"
          min={1}
          max={5}
          step={1}
          value={value.stars}
          onChange={(e) => update('stars', Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
          className="h-10 px-3 rounded-lg w-full transition-shadow duration-150"
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
          onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
        />
      </Field>

      {/* Price range */}
      <Field label="Price range">
        <div className="relative">
          <select
            value={value.attributes.price_range}
            onChange={(e) =>
              updateAttr('price_range', e.target.value as BusinessObject['attributes']['price_range'])
            }
            className="w-full h-10 pl-3 pr-8 rounded-lg appearance-none transition-shadow duration-150"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            {PRICE_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true"
          >
            <path d="M1 1l5 5 5-5" stroke="#8C8982" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Field>

      {/* Toggles */}
      <div
        className="flex flex-col gap-3 px-4 py-3 rounded-lg"
        style={{ backgroundColor: '#FAFAF8', border: '0.5px solid #e8e6e0' }}
      >
        <Toggle
          label="Outdoor seating"
          value={value.attributes.outdoor_seating}
          onChange={(v) => updateAttr('outdoor_seating', v)}
        />
        <div style={{ height: '0.5px', backgroundColor: '#e8e6e0' }} />
        <Toggle
          label="WiFi available"
          value={value.attributes.wifi}
          onChange={(v) => updateAttr('wifi', v)}
        />
      </div>
    </div>
  )
}
