import styles from './Reglas.module.css'

const RULES = [
  {
    title: 'Código de conducta',
    items: [
      'Respeto: es la regla más importante del clan y no se toma a juego, expulsión asegurada.',
      'Donaciones: pedimos un mínimo de 150 donaciones semanales.',
      'Guerra: los días de entrenamiento pueden descansar, pero en días de guerra se espera su participación.',
      'Descanso: se puede pedir descanso, solo notifiquen en el clan para no expulsarlos por accidente.',
    ],
  },
  {
    title: 'Expulsiones semanales',
    danger: true,
    items: [
      'Baja donación y pobre participación en guerra es expulsión.',
      'Faltar el respeto a miembros del clan.',
      'Expulsar miembros sin haber consultado antes con el líder.',
    ],
  },
  {
    title: 'Veteranía',
    items: [
      'Cumplir con las donaciones y la participación en la guerra te asegura veteranía.',
    ],
  },
]

const COLIDERATO_STEPS = [
  'Debes ser veterano primero.',
  'Debes ser activo en el clan, no solo en donaciones y guerra — la convivencia social nos dice quién eres.',
  'Se debe solicitar y esperar la aprobación del líder y los otros colíderes para saber si el candidato demuestra ser un miembro activo.',
  'Si los miembros te aceptan como aspirante, debes elegir a un colíder para vencerlo en un reto: batalla mejor de tres (máximo tres batallas).',
  'El tipo de partida lo eligen los jugadores — se recomienda estilo duelo, pero lo pueden convenir.',
  'De ganar, serás ascendido.',
]

const COLIDERATO_RESPONSIBILITIES = [
  'Como colíder nunca serás expulsado por falta de participación o donaciones.',
  'Deberás cuidar el clan y revisar que no rompan el código de conducta.',
]

export function Reglas() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Reglas del Clan</h1>
      <p className={styles.description}>
        Reglas de Infinity Wars MX — léelas con calma, aplican para todos los miembros.
      </p>

      <div className={styles.sections}>
        {RULES.map(section => (
          <section key={section.title} className={`${styles.card} ${section.danger ? styles.danger : ''}`}>
            <h2 className={styles.cardTitle}>{section.title}</h2>
            <ul className={styles.list}>
              {section.items.map(item => <li key={item}>{item}</li>)}
            </ul>
          </section>
        ))}

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Colíderato</h2>
          <p className={styles.note}>Máximo 10 colíderes · un reto por mes por jugador.</p>

          <ol className={styles.orderedList}>
            {COLIDERATO_STEPS.map(step => <li key={step}>{step}</li>)}
          </ol>

          <ul className={styles.list}>
            {COLIDERATO_RESPONSIBILITIES.map(item => <li key={item}>{item}</li>)}
          </ul>

          <p className={styles.critical}>
            ⚠️ Cualquier miembro que consideres expulsar, no lo hagas sin previa aprobación del líder del clan, <span className={styles.criticalName}>RagnarLodbrock</span>.
          </p>
        </section>
      </div>
    </main>
  )
}
