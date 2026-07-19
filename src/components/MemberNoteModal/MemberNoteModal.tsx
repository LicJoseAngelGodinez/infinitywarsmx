import { useState, useEffect, type FormEvent } from 'react'
import { Modal } from '@/components/Modal'
import { supabase } from '@/lib/supabase'
import type { AdminUserRow } from '@/hooks/useAdminUsers'
import styles from './MemberNoteModal.module.css'

interface MemberNoteModalProps {
  user: AdminUserRow | null
  onClose: () => void
  onSaved: () => void
}

export function MemberNoteModal({ user, onClose, onSaved }: MemberNoteModalProps) {
  const [note, setNote] = useState('')
  const [ptoStart, setPtoStart] = useState('')
  const [ptoEnd, setPtoEnd] = useState('')
  const [phrase, setPhrase] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setNote(user.note?.note ?? '')
    setPtoStart(user.note?.pto_start ?? '')
    setPtoEnd(user.note?.pto_end ?? '')
    setPhrase(user.note?.phrase ?? '')
    setError(null)
  }, [user])

  if (!user) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const { error: dbError } = await supabase.from('member_notes').upsert({
      tag: user!.tag,
      note: note || null,
      pto_start: ptoStart || null,
      pto_end: ptoEnd || null,
      phrase: phrase || null,
    })

    setIsSaving(false)

    if (dbError) {
      console.error('member_notes upsert error:', dbError)
      setError('No se pudo guardar, intenta de nuevo.')
      return
    }

    onSaved()
  }

  return (
    <Modal isOpen={!!user} onClose={onClose} title={`Editar — ${user.name}`}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Nota
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            className={styles.textarea}
          />
        </label>

        <div className={styles.row}>
          <label className={styles.label}>
            PTO desde
            <input
              type="date"
              value={ptoStart}
              onChange={e => setPtoStart(e.target.value)}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            PTO hasta
            <input
              type="date"
              value={ptoEnd}
              onChange={e => setPtoEnd(e.target.value)}
              className={styles.input}
            />
          </label>
        </div>

        <label className={styles.label}>
          Frase
          <input
            type="text"
            value={phrase}
            onChange={e => setPhrase(e.target.value)}
            className={styles.input}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={isSaving} className={styles.submitBtn}>
          {isSaving ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </Modal>
  )
}
