import { useState } from 'react'
import { useAdminUsers, type AdminUserRow } from '@/hooks/useAdminUsers'
import { useFormerMembers } from '@/hooks/useFormerMembers'
import { ROLE_LABEL, ROLE_ICON } from '@/utils/roles'
import { supabase } from '@/lib/supabase'
import { MemberNoteModal } from '@/components/MemberNoteModal'
import { ConfirmActionModal } from '@/components/ConfirmActionModal'
import { PlayerLink } from '@/components/PlayerLink'
import styles from './UsersSection.module.css'

interface PendingDeletion {
  tag: string;
  title: string;
  message: string;
  successMessage: string;
}

export function UsersSection() {
  const { currentUsers, formerRegistrations, isLoading, refetch } = useAdminUsers()
  const { formerMembers, isLoading: isLoadingFormerMembers } = useFormerMembers()
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null)
  const [formerSearch, setFormerSearch] = useState('')

  async function handleDeleteRegistration(tag: string) {
    const { error } = await supabase.from('whatsapp_registrations').delete().eq('tag', tag)
    if (error) throw error
    refetch()
  }

  const filteredFormerMembers = formerMembers.filter(m => {
    const q = formerSearch.trim().toLowerCase()
    if (!q) return true
    return m.name.toLowerCase().includes(q) || m.tag.toLowerCase().includes(q)
  })

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
                <td className={styles.name}>{u.clanRank}. <PlayerLink tag={u.tag} name={u.name} /></td>
                <td>{ROLE_LABEL[u.role]} {ROLE_ICON[u.role]}</td>
                <td>{u.isRegistered ? '✅' : '—'}</td>
                <td>
                  {u.note?.pto_start
                    ? `${u.note.pto_start} → ${u.note.pto_end ?? '?'}`
                    : '—'}
                </td>
                <td className={styles.noteCell}>{u.note?.note || '—'}</td>
                <td className={styles.actionsCell}>
                  <button
                    className={`${styles.actionBtn} ${styles.iconBtn}`}
                    aria-label="Editar"
                    onClick={() => setEditingUser(u)}
                  >
                    ✏️
                  </button>
                  {u.isRegistered && (
                    <button
                      className={`${styles.deleteBtn} ${styles.iconBtn}`}
                      aria-label="Revertir registro de WhatsApp"
                      onClick={() => setPendingDeletion({
                        tag: u.tag,
                        title: 'Revertir registro de WhatsApp',
                        message: `¿Revertir el registro de WhatsApp de ${u.name}? Va a desaparecer de la lista de registrados.`,
                        successMessage: 'Registro revertido correctamente.',
                      })}
                    >
                      📵
                    </button>
                  )}
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
                  <td className={styles.name}><PlayerLink tag={r.tag} name={r.name} /></td>
                  <td>{r.phone}</td>
                  <td>{new Date(r.registered_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setPendingDeletion({
                        tag: r.tag,
                        title: 'Borrar registro de WhatsApp',
                        message: `¿Borrar el registro de WhatsApp de ${r.name}?`,
                        successMessage: 'Registro borrado correctamente.',
                      })}
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.wrapper}>
        <h2 className={styles.subtitle}>Historial de ex-miembros</h2>
        <input
          type="text"
          placeholder="Buscar por nombre o tag…"
          className={styles.searchInput}
          value={formerSearch}
          onChange={e => setFormerSearch(e.target.value)}
        />
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tag</th>
              <th>Se unió</th>
              <th>Salió</th>
              <th>Veces en el clan</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingFormerMembers ? (
              <tr><td colSpan={5} className={styles.emptyRow}>Cargando…</td></tr>
            ) : filteredFormerMembers.length === 0 ? (
              <tr><td colSpan={5} className={styles.emptyRow}>Sin resultados.</td></tr>
            ) : (
              filteredFormerMembers.map(m => (
                <tr key={m.tag}>
                  <td className={styles.name}><PlayerLink tag={m.tag} name={m.name} /></td>
                  <td>{m.tag}</td>
                  <td>{m.joinedDate}</td>
                  <td>{m.leftDate}</td>
                  <td>{m.rejoinCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <MemberNoteModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSaved={() => { setEditingUser(null); refetch() }}
      />

      <ConfirmActionModal
        isOpen={pendingDeletion !== null}
        title={pendingDeletion?.title ?? ''}
        message={pendingDeletion?.message ?? ''}
        confirmLabel="Sí, continuar"
        successMessage={pendingDeletion?.successMessage ?? ''}
        errorMessage="No se pudo completar la acción. Intenta de nuevo."
        onConfirm={() => handleDeleteRegistration(pendingDeletion!.tag)}
        onClose={() => setPendingDeletion(null)}
      />
    </>
  )
}
