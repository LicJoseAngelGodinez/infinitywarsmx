import { useState } from 'react'
import { useAdminUsers, type AdminUserRow } from '@/hooks/useAdminUsers'
import { ROLE_LABEL, ROLE_ICON } from '@/utils/roles'
import { supabase } from '@/lib/supabase'
import { MemberNoteModal } from '@/components/MemberNoteModal'
import styles from './UsersSection.module.css'

export function UsersSection() {
  const { currentUsers, formerRegistrations, isLoading, refetch } = useAdminUsers()
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null)
  const [deletingTag, setDeletingTag] = useState<string | null>(null)

  async function handleDeleteRegistration(tag: string) {
    if (!confirm('¿Borrar el registro de WhatsApp de este ex-miembro?')) return

    setDeletingTag(tag)
    const { error } = await supabase.from('whatsapp_registrations').delete().eq('tag', tag)
    setDeletingTag(null)

    if (error) {
      console.error('whatsapp_registrations delete error:', error)
      return
    }

    refetch()
  }

  if (isLoading) return <p className={styles.loading}>Cargando…</p>

  return (
    <>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Rol</th>
              <th>WhatsApp</th>
              <th>PTO</th>
              <th>Nota</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(u => (
              <tr key={u.tag}>
                <td className={styles.name}>{u.clanRank}. {u.name}</td>
                <td>{ROLE_LABEL[u.role]} {ROLE_ICON[u.role]}</td>
                <td>{u.isRegistered ? '✅' : '—'}</td>
                <td>
                  {u.note?.pto_start
                    ? `${u.note.pto_start} → ${u.note.pto_end ?? '?'}`
                    : '—'}
                </td>
                <td className={styles.noteCell}>{u.note?.note || '—'}</td>
                <td>
                  <button className={styles.actionBtn} onClick={() => setEditingUser(u)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formerRegistrations.length > 0 && (
        <div className={styles.wrapper}>
          <h2 className={styles.subtitle}>Registros de WhatsApp de ex-miembros</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Registrado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {formerRegistrations.map(r => (
                <tr key={r.tag}>
                  <td className={styles.name}>{r.name}</td>
                  <td>{r.phone}</td>
                  <td>{new Date(r.registered_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      disabled={deletingTag === r.tag}
                      onClick={() => handleDeleteRegistration(r.tag)}
                    >
                      {deletingTag === r.tag ? 'Borrando…' : 'Borrar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MemberNoteModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSaved={() => { setEditingUser(null); refetch() }}
      />
    </>
  )
}
