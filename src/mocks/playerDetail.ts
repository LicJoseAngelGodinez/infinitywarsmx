import type { PlayerDetail } from '@/types/clan'

// Stand-in temporal mientras no existe el cron de member_details (ver
// clean-player.json y la nota en CLAUDE.md). Solo se usa para probar el
// flujo/diseño del perfil con un jugador conocido -- a propósito no se
// generaliza a todos los tags todavía, así no hace falta manejar campos
// faltantes que hoy no aplican.
export const MOCK_PLAYER_DETAIL: PlayerDetail = {
  tag: '#82RJCU2JY',
  name: 'RagnarLodbrock',
  expLevel: 76,
  trophies: 13666,
  bestTrophies: 13675,
  wins: 6147,
  losses: 5902,
  battleCount: 12049,
  threeCrownWins: 2986,
  role: 'leader',
  totalDonations: 126707,
  warDayWins: 109,
  currentDeck: [
    {
      name: 'Goblin Cage',
      id: 27000012,
      elixirCost: 4,
      iconUrls: {
        medium: 'https://api-assets.clashroyale.com/cards/300/vD24bBgK4rSq7wx5QEbuqChtPMRFviL_ep76GwQw1yA.png',
        evolutionMedium: 'https://api-assets.clashroyale.com/cardevolutions/300/vD24bBgK4rSq7wx5QEbuqChtPMRFviL_ep76GwQw1yA.png',
      },
    },
    {
      name: 'Musketeer',
      id: 26000014,
      elixirCost: 4,
      iconUrls: {
        medium: 'https://api-assets.clashroyale.com/cards/300/Tex1C48UTq9FKtAX-3tzG0FJmc9jzncUZG3bb5Vf-Ds.png',
        heroMedium: 'https://api-assets.clashroyale.com/cardheroes/300/Tex1C48UTq9FKtAX-3tzG0FJmc9jzncUZG3bb5Vf-Ds.png',
        evolutionMedium: 'https://api-assets.clashroyale.com/cardevolutions/300/Tex1C48UTq9FKtAX-3tzG0FJmc9jzncUZG3bb5Vf-Ds.png',
      },
    },
    {
      name: 'Furnace',
      id: 27000010,
      elixirCost: 4,
      iconUrls: {
        medium: 'https://api-assets.clashroyale.com/cards/300/iqbDiG7yYRIzvCPXdt9zPb3IvMt7F7Gi4wIPnh2x4aI.png',
        evolutionMedium: 'https://api-assets.clashroyale.com/cardevolutions/300/iqbDiG7yYRIzvCPXdt9zPb3IvMt7F7Gi4wIPnh2x4aI.png',
      },
    },
    {
      name: 'Arrows',
      id: 28000001,
      elixirCost: 3,
      iconUrls: {
        medium: 'https://api-assets.clashroyale.com/cards/300/Flsoci-Y6y8ZFVi5uRFTmgkPnCmMyMVrU7YmmuPvSBo.png',
      },
    },
    {
      name: 'Goblin Gang',
      id: 26000041,
      elixirCost: 3,
      iconUrls: {
        medium: 'https://api-assets.clashroyale.com/cards/300/NHflxzVAQT4oAz7eDfdueqpictb5vrWezn1nuqFhE4w.png',
      },
    },
    {
      name: 'Bandit',
      id: 26000046,
      elixirCost: 3,
      iconUrls: {
        medium: 'https://api-assets.clashroyale.com/cards/300/QWDdXMKJNpv0go-HYaWQWP6p8uIOHjqn-zX7G0p3DyM.png',
      },
    },
    {
      name: 'P.E.K.K.A',
      id: 26000004,
      elixirCost: 7,
      iconUrls: {
        medium: 'https://api-assets.clashroyale.com/cards/300/MlArURKhn_zWAZY-Xj1qIRKLVKquarG25BXDjUQajNs.png',
        evolutionMedium: 'https://api-assets.clashroyale.com/cardevolutions/300/MlArURKhn_zWAZY-Xj1qIRKLVKquarG25BXDjUQajNs.png',
      },
    },
    {
      name: 'Zap',
      id: 28000008,
      elixirCost: 2,
      iconUrls: {
        medium: 'https://api-assets.clashroyale.com/cards/300/7dxh2-yCBy1x44GrBaL29vjqnEEeJXHEAlsi5g6D1eY.png',
        evolutionMedium: 'https://api-assets.clashroyale.com/cardevolutions/300/7dxh2-yCBy1x44GrBaL29vjqnEEeJXHEAlsi5g6D1eY.png',
      },
    },
  ],
  currentDeckSupportCards: [
    {
      name: 'Tower Princess',
      iconUrls: {
        medium: 'https://api-assets.clashroyale.com/cards/300/Nzo5Gjbh7NG6O3Hyu7ev54Pu5zK7vDMR2fbpGdVsS64.png',
      },
    },
  ],
  currentFavouriteCard: {
    name: 'P.E.K.K.A',
    iconUrls: {
      medium: 'https://api-assets.clashroyale.com/cards/300/MlArURKhn_zWAZY-Xj1qIRKLVKquarG25BXDjUQajNs.png',
      evolutionMedium: 'https://api-assets.clashroyale.com/cardevolutions/300/MlArURKhn_zWAZY-Xj1qIRKLVKquarG25BXDjUQajNs.png',
    },
    rarity: 'epic',
  },
}
