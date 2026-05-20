import { LucideIcon } from 'lucide-react'

interface ImagePlaceholderProps {
  width: string
  height: string
  icon: LucideIcon
  label: string
}

export default function ImagePlaceholder({ width, height, icon: Icon, label }: ImagePlaceholderProps) {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#F5F4F0',
        border: '1.5px dashed #D3D1C7',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <Icon size={16} color="#B0ADA6" strokeWidth={1.5} />
      <span
        style={{
          fontSize: '11px',
          color: '#B0ADA6',
          fontWeight: 400,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  )
}
