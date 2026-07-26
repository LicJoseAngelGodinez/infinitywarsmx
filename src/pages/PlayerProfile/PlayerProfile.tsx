import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useClanData } from '@/context/ClanDataContext'
import { PlayerDetailCard } from '@/components/PlayerDetailCard'
import { ROLE_LABEL, ROLE_ICON } from '@/utils/roles'
import type { PlayerDetail } from '@/types/clan'
import styles from './PlayerProfile.module.css'

export function PlayerProfile() {
  const { tag } = useParams<{ tag: string }>()
  const { members } = useClanData()
  const member = members.find(m => m.tag === tag)

  const detailQuery = useQuery({
    queryKey: ['player-detail', member?.tag],
    enabled: !!member,
    queryFn: async () => {
      const res = await fetch(`/api/player-detail?tag=${encodeURIComponent(member!.tag)}`)
      if (res.status === 404) return null
      if (!res.ok) throw new Error('player-detail request failed')
      return res.json() as Promise<PlayerDetail>
    },
  })

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

  if (detailQuery.isLoading) {
    return (
      <main className={styles.container}>
        <h1 className={styles.name}>{member.name}</h1>
        <p className={styles.role}>{ROLE_LABEL[member.role]} {ROLE_ICON[member.role]}</p>
        <p className={styles.favCard}>Cargando…</p>
      </main>
    )
  }

  const player = detailQuery.data

  if (!player) {
    return (
      <main className={styles.container}>
        <h1 className={styles.name}>{member.name}</h1>
        <p className={styles.role}>{ROLE_LABEL[member.role]} {ROLE_ICON[member.role]}</p>
        <p className={styles.favCard}>Carta favorita: (pendiente)</p>
      </main>
    )
  }

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
            {fav ? (
              <>
                <img src={fav.iconUrls.medium} alt={fav.name} className={styles.favImage} />
                <p className={styles.favLabel}>Carta favorita</p>
              </>
            ) : (
              <p className={styles.favLabel}>Sin carta favorita</p>
            )}
          </PlayerDetailCard>
        </div>

        <div className={styles.right}>
          {phraseQuery.data ? (
            <p className={styles.phrase}>“{phraseQuery.data}”</p>
          ) : (
            <p className={styles.phrasePlaceholder}>
              ¿Quieres colocar tu marca de guerrero? Únete a la comunidad y envía el mensaje que deseas se muestre en tu perfil.
            </p>
          )}
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
