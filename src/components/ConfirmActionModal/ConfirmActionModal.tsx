import { useState } from 'react'
import { Modal } from '@/components/Modal'
import styles from './ConfirmActionModal.module.css'

type Phase = 'confirm' | 'loading' | 'success' | 'error'

interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  successMessage: string;
  errorMessage?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

// Confirmación genérica con loading/éxito/error dentro del mismo modal --
// nunca usar confirm()/alert() nativos del navegador para acciones
// destructivas del panel admin.
export function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  successMessage,
  errorMessage = 'Algo salió mal. Intenta de nuevo.',
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  const [phase, setPhase] = useState<Phase>('confirm')

  async function handleConfirm() {
    setPhase('loading')
    try {
      await onConfirm()
      setPhase('success')
    } catch {
      setPhase('error')
    }
  }

  function handleClose() {
    onClose()
    setTimeout(() => setPhase('confirm'), 200)
  }

  return (
    <Modal isOpen={isOpen} onClose={phase === 'loading' ? () => {} : handleClose} title={title}>
      {phase === 'confirm' && (
        <>
          <p className={styles.message}>{message}</p>
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={handleClose}>Cancelar</button>
            <button className={styles.confirmBtn} onClick={handleConfirm}>{confirmLabel}</button>
          </div>
        </>
      )}

      {phase === 'loading' && <p className={styles.message}>Procesando…</p>}

      {phase === 'success' && (
        <>
          <p className={styles.success}>{successMessage}</p>
          <div className={styles.actions}>
            <button className={styles.confirmBtn} onClick={handleClose}>Cerrar</button>
          </div>
        </>
      )}

      {phase === 'error' && (
        <>
          <p className={styles.errorText}>{errorMessage}</p>
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={handleClose}>Cerrar</button>
          </div>
        </>
      )}
    </Modal>
  )
}
