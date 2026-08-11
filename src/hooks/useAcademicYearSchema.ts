import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../lib/supabase'

export type AcademicYearSchemaStatus = 'checking' | 'ready' | 'missing' | 'unavailable'

function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? String(error.code) : ''
  const message = 'message' in error ? String(error.message).toLowerCase() : ''
  return code === '42703'
    || code === 'PGRST204'
    || (message.includes('academic_year') && (message.includes('does not exist') || message.includes('schema cache')))
}

export function useAcademicYearSchema() {
  const [status, setStatus] = useState<AcademicYearSchemaStatus>('checking')

  useEffect(() => {
    let cancelled = false

    const checkSchema = async () => {
      try {
        const client = getSupabaseClient()
        const { error } = await client.from('photos').select('academic_year').limit(1)
        if (cancelled) return
        if (!error) {
          setStatus('ready')
        } else {
          setStatus(isMissingColumnError(error) ? 'missing' : 'unavailable')
        }
      } catch {
        if (!cancelled) setStatus('unavailable')
      }
    }

    void checkSchema()
    return () => {
      cancelled = true
    }
  }, [])

  return status
}
