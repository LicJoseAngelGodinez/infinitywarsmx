import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useClanData } from '@/context/ClanDataContext'
import { PlayerDetailCard } from '@/components/PlayerDetailCard'
import { MOCK_PLAYER_DETAIL } from '@/mocks/playerDetail'
import { ROLE_LABEL, ROLE_ICON } from '@/utils/roles'
import styles from './PlayerProfile.module.css'

// Placeholder para probar el flujo de navegación (tag → perfil) y el diseño
// del layout. El cron de member_details (ver clean-player.json) todavía no
// existe -- por eso solo el tag de prueba en MOCK_PLAYER_DETAIL tiene data
// real; el resto de jugadores activos cae en el texto de "pendiente".
export function PlayerProfile() {
  const { tag } = useParams<{ tag: string }>()
  const { members } = useClanData()
  const member = members.find(m => m.tag === tag)

  const phraseQuery = useQuery({
    queryKey: ['player-phrase', member?.tag],
    enabled: !!member,
    queryFn: async () => {
      const res = await fetch(`/api/player-phrase?tag=${encodeURIComponent(member!.tag)}`)
      const data = await res.json()
      return data.phrase as string | null
    },
  })

  if (!member) {
    return (
      <main className={styles.container}>
        <p className={styles.notFound}>
          Jugador no encontrado o ya no pertenece al clan.
        </p>
      </main>
    )
  }

  if (member.tag !== MOCK_PLAYER_DETAIL.tag) {
    return (
      <main className={styles.container}>
        <h1 className={styles.name}>{member.name}</h1>
        <p className={styles.role}>{ROLE_LABEL[member.role]} {ROLE_ICON[member.role]}</p>
        <p className={styles.favCard}>Carta favorita: (pendiente)</p>
      </main>
    )
  }

  const player = MOCK_PLAYER_DETAIL
  const fav = player.currentFavouriteCard

  return (
    <main className={styles.container}>
      <h1 className={styles.name}>{player.name}</h1>
      <p className={styles.role}>
        {ROLE_LABEL[member.role]} {ROLE_ICON[member.role]} · Nivel {player.expLevel}
      </p>

      <div className={styles.body}>
        <div className={styles.left}>
          <PlayerDetailCard>
            <img src={fav.iconUrls.medium} alt={fav.name} className={styles.favImage} />
            <p className={styles.favLabel}>Carta favorita</p>
          </PlayerDetailCard>
        </div>

        <div className={styles.right}>
          {phraseQuery.data && <p className={styles.phrase}>“{phraseQuery.data}”</p>}
          <hr className={styles.divider} />
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>Trofeos</dt>
              <dd>{player.trophies.toLocaleString()}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Mejor trofeos</dt>
              <dd>{player.bestTrophies.toLocaleString()}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Victorias</dt>
              <dd>{player.wins.toLocaleString()}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Derrotas</dt>
              <dd>{player.losses.toLocaleString()}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Batallas totales</dt>
              <dd>{player.battleCount.toLocaleString()}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Victorias 3 coronas</dt>
              <dd>{player.threeCrownWins.toLocaleString()}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Victorias en guerra</dt>
              <dd>{player.warDayWins.toLocaleString()}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Donaciones totales</dt>
              <dd>{player.totalDonations.toLocaleString()}</dd>
            </div>
          </dl>

          <div className={styles.deckGrid}>
            {player.currentDeck.map(card => (
              <img
                key={card.name}
                src={card.iconUrls.medium}
                alt={card.name}
                className={styles.deckCard}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
