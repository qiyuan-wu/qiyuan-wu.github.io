// Dream XI — the starting eleven shown on the pitch.
//
// EDIT THIS FILE to change players or where a card sits. Each card is the
// downloaded image itself (rating/stats live in the image), so an entry is just:
//
//   id      unique key (any short string)
//   pos     position label shown on empty slots (GK, CB, LWB, CM, LW, ST, …)
//   name    player name — used for the image's alt text; '' = empty slot
//   image   path to the card image, e.g. '/players/ronaldo.png'. Drop the file
//           in public/players/ and reference it as '/players/<file>'. Leave ''
//           to render a dashed "add a player" placeholder. See public/players/README.
//   x, y    where the card sits on the pitch, in PERCENT of the pitch box:
//             x = 0 (left touchline)  → 100 (right touchline)
//             y = 0 (attacking third) → 100 (own goal / GK)
//           So low y = up the pitch (forwards), high y = deep (keeper).

export const FORMATION = '3-4-3'

export const PLAYERS = [
  // ---- Front three -----------------------------------------------------
  { id: 'lw', pos: 'LW', name: 'Rafael Leão', image: '/players/leao.png', x: 22, y: 19 },
  { id: 'st', pos: 'ST', name: 'Romelu Lukaku', image: '/players/lukaku.png', x: 50, y: 13 },
  { id: 'rw', pos: 'RW', name: 'Cristiano Ronaldo', image: '/players/ronaldo.png', x: 78, y: 19 },

  // ---- Midfield four (wing-backs + two central) ------------------------
  { id: 'lwb', pos: 'LWB', name: 'Marcelo', image: '/players/marcelo.png', x: 13, y: 45 },
  { id: 'lcm', pos: 'CM', name: 'Andrés Iniesta', image: '/players/iniesta.png', x: 39, y: 46 },
  { id: 'rcm', pos: 'CM', name: '', image: '', x: 61, y: 46 },
  { id: 'rwb', pos: 'RWB', name: '', image: '', x: 87, y: 45 },

  // ---- Back three ------------------------------------------------------
  { id: 'lcb', pos: 'LCB', name: 'Theo Hernández', image: '/players/hernandez.png', x: 27, y: 71 },
  { id: 'cb', pos: 'CB', name: 'Virgil van Dijk', image: '/players/vandijk.png', x: 50, y: 71 },
  { id: 'rcb', pos: 'RCB', name: '', image: '', x: 73, y: 71 },

  // ---- Goalkeeper ------------------------------------------------------
  { id: 'gk', pos: 'GK', name: 'Guillermo Ochoa', image: '/players/ochoa.png', x: 50, y: 94 },
]
