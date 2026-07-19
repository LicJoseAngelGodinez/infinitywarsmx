import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Modal } from '@/components/Modal'
import { useClanData } from '@/context/ClanDataContext'
import { supabase } from '@/lib/supabase'
import styles from './WhatsAppJoinModal.module.css'

interface WhatsAppJoinModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WhatsAppJoinModal({ isOpen, onClose }: WhatsAppJoinModalProps) {
  const { members } = useClanData()
  const [tag, setTag] = useState('')
  const [phone, setPhone] = useState('')
  const [realName, setRealName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const linkQuery = useQuery({
    queryKey: ['app_settings', 'whatsapp_link'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'whatsapp_link')
        .single()
      if (error) throw error
      return data.value as string
    },
    enabled: isOpen,
  })

  // Solo tags -- este endpoint nunca expone teléfonos ni nombres.
  const registeredTagsQuery = useQuery({
    queryKey: ['whatsapp-tags'],
    queryFn: async () => {
      const res = await fetch('/api/whatsapp-tags')
      const data: { tags: string[] } = await res.json()
      return new Set(data.tags)
    },
    enabled: isOpen,
  })

  const availableMembers = members.filter(m => !registeredTagsQuery.data?.has(m.tag))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const member = members.find(m => m.tag === tag)
    if (!member) {
      setError('Elige tu jugador de la lista.')
      return
    }
    if (!linkQuery.data) {
      setError('No se pudo cargar el link todavía, intenta de nuevo en un momento.')
      return
    }

    setIsSubmitting(true)
    const { error: dbError } = await supabase
      .from('whatsapp_registrations')
      .insert({ tag: member.tag, name: member.name, real_name: realName || null, phone })
    setIsSubmitting(false)

    // 23505 = llave duplicada (ya se había registrado) -- no es un error
    // real, solo significa que ya existe su fila. Cualquier otro código
    // sí es un fallo genuino.
    if (dbError && dbError.code !== '23505') {
      console.error('whatsapp_registrations insert error:', dbError)
      setError('No se pudo registrar, intenta de nuevo.')
      return
    }

    window.location.href = linkQuery.data
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Únete a la comunidad de WhatsApp">
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Tu jugador
          <select
            value={tag}
            onChange={e => setTag(e.target.value)}
            required
            className={styles.input}
          >
            <option value="" disabled>Selecciona tu nombre</option>
            {availableMembers.map(m => (
              <option key={m.tag} value={m.tag}>{m.name}</option>
            ))}
          </select>
        </label>

        <label className={styles.label}>
          Teléfono
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Nombre real (opcional)
          <input
            type="text"
            value={realName}
            onChange={e => setRealName(e.target.value)}
            className={styles.input}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
          {isSubmitting ? 'Enviando…' : 'Unirme'}
        </button>
      </form>
    </Modal>
  )
}
