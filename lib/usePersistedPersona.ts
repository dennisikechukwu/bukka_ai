import { useState, useEffect } from 'react'
import { PersonaObject } from './agents'

const STORAGE_KEY = 'bukka_persona_v1'

export function usePersistedPersona(defaultPersona: PersonaObject) {
  const [persona, setPersonaState] = useState<PersonaObject>(defaultPersona)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersonaObject>
        setPersonaState((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // corrupted storage — ignore
    }
  }, [])

  function setPersona(updated: PersonaObject) {
    setPersonaState(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {}
  }

  return { persona, setPersona }
}
