'use client'

import { useState, KeyboardEvent, useRef } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export default function TagInput({ tags, onChange, placeholder = 'Type and press Enter' }: TagInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(raw: string) {
    const trimmed = raw.trim().replace(/,$/, '')
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 items-center min-h-[40px] px-3 py-2 cursor-text transition-all duration-150"
      style={{ border: '0.5px solid #D3D1C7', backgroundColor: '#fff', borderRadius: '8px' }}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span
          key={i}
          className="flex items-center gap-1 rounded"
          style={{
            backgroundColor: '#FFF3EF',
            color: '#993C1D',
            border: '0.5px solid #F5C4B3',
            fontSize: '12px',
            fontWeight: 400,
            padding: '3px 6px 3px 8px',
            lineHeight: 1.4,
          }}
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange(tags.filter((_, idx) => idx !== i))
            }}
            className="flex items-center transition-opacity duration-150 hover:opacity-70"
            style={{ color: '#993C1D' }}
            aria-label={`Remove ${tag}`}
          >
            <X size={10} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input) }}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 outline-none bg-transparent"
        style={{
          fontSize: '14px',
          color: '#2C2C2A',
          minWidth: '120px',
        }}
      />
    </div>
  )
}
