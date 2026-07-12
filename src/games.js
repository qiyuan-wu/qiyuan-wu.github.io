// Games to showcase, no particular order. Each maps to its Steam app ID; the
// banner and store link are derived from that, so there are no image files to
// manage.
//
// Optional `image` overrides the derived banner with a specific URL — handy for
// non-Steam games that have no CDN header at all.
export const GAMES = [
  { id: 'fallout-nv', title: 'Fallout: New Vegas', year: 2010, appid: 22380 },
  { id: 'fallout-4', title: 'Fallout 4', year: 2015, appid: 377160 },
  { id: 'fallout-76', title: 'Fallout 76', year: 2018, appid: 1151340 },
  { id: 'skyrim', title: 'The Elder Scrolls V: Skyrim', year: 2011, appid: 72850 },
  { id: 'starfield', title: 'Starfield', year: 2023, appid: 1716740 },
  { id: 'kcd2', title: 'Kingdom Come: Deliverance II', year: 2025, appid: 1771300 },
  { id: 'galaxy-on-fire-2', title: 'Galaxy on Fire 2 Full HD', year: 2012, appid: 212010 },
  { id: 'ac-origins', title: "Assassin's Creed Origins", year: 2017, appid: 582160 },
  { id: 'ac-odyssey', title: "Assassin's Creed Odyssey", year: 2018, appid: 812140 },
  { id: 'black-myth-wukong', title: 'Black Myth: Wukong', year: 2024, appid: 2358720 },
  { id: 'far-cry-5', title: 'Far Cry 5', year: 2018, appid: 552520 },
  { id: 'mount-and-blade-warband', title: 'Mount & Blade: Warband', year: 2010, appid: 48700 },
]

// capsule_616x353 is the higher-res store capsule (still carries the game
// name/logo) — much sharper than header.jpg when shown large.
export const bannerUrl = (appid) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_616x353.jpg`

export const storeUrl = (appid) =>
  `https://store.steampowered.com/app/${appid}/`
