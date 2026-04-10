'use client'
import { Camera } from 'lucide-react'
import { useState, useRef, ChangeEvent, useEffect } from 'react'

const MAX_SIZE_MB = 2
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

type Props = {
  value?: string | null
  onChange?: (file: File, previewUrl: string) => void
  onRemove?: () => void
  variant?: 'circle' | 'square' // ← nouveau
}

export default function PhotoSelector({ value, onChange, onRemove, variant = 'circle' }: Props) {
  const [preview, setPreview] = useState<string | null>(value ?? null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
  console.log("VALUE REÇUE :", value)

  if (value && typeof value === "string") {
    setPreview(value)
  }else {
    setPreview(null) // ← reset si pas de photo
  }
}, [value])


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Format invalide. Utilisez JPG ou PNG.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Fichier trop lourd. Maximum ${MAX_SIZE_MB} Mo.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      const result = ev.target?.result
      if (typeof result !== 'string') return
      setPreview(result)
      onChange?.(file, result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
    onRemove?.()
  }
  const isSquare = variant === 'square'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

      {/* Avatar */}
      <div style={{
        width: 64, height: 64, flexShrink: 0,
        borderRadius: isSquare ? 12 : '50%',
        overflow: 'hidden',
        background: '#DDEAD5',
        border: preview ? '0.5px solid var(--color-border-tertiary)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {preview
          ? <img src={preview} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Camera size={24} color="#2E7D32" />
        }
      </div>

      {/* Contrôles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label htmlFor="photo-input" style={{
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 8,
            background: '#DDEAD5', color: '#1B5E20',
            fontSize: 13, fontWeight: 500, border: 'none',
          }}>
            <Camera size={14} />
            {preview ? 'Changer la photo' : 'Ajouter une photo'}
          </label>
          <input ref={inputRef} id="photo-input" type="file" accept=".jpg,.jpeg,.png"
            style={{ display: 'none' }} onChange={handleFileChange} />
          {preview && (
            <button onClick={handleRemove} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: 'var(--color-text-secondary)', padding: 0, fontFamily: 'inherit',
            }}>
              Supprimer
            </button>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-tertiary)' }}>
          JPG, PNG — max 2 Mo
        </p>
        {error && <p style={{ margin: 0, fontSize: 12, color: '#dc2626' }}>{error}</p>}
      </div>

    </div>
  )
}