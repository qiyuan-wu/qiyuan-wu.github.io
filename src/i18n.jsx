import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Every visitor-facing string on the site, in both languages. Data files
// (album titles, player names, game titles) are deliberately not here — they
// are proper nouns and stay as written. The owner-only editors stay English.
const STRINGS = {
  en: {
    'nav.albums': 'Albums',
    'nav.games': 'Games',
    'nav.soccer': 'Soccer',
    'nav.tree': 'Tree',
    'nav.switch': '中文',
    'nav.switchLabel': 'Switch to Chinese',

    'home.eyebrow': 'Personal archive',
    'home.albums': 'Records on permanent rotation',
    'home.games': 'Favorite worlds and adventures',
    'home.soccer': 'The players I remember most',
    'home.tree': 'Species I know, by how they are related',

    'albums.title': 'Albums + comps',
    'albums.eyebrow': 'On repeat',
    'albums.songs': '{n} songs',
    'albums.close': 'Close album',

    'games.title': 'Games',
    'games.eyebrow': 'Played & remembered',
    'games.steam': 'View on Steam ↗',
    'games.prev': 'Previous game',
    'games.next': 'Next game',

    'soccer.title': 'Most Memorable XI',
    'soccer.formation': 'Formation',
    'soccer.squad': 'Matchday squad',
    'soccer.subs': 'Substitutes',
    'soccer.places': '{n} places',
    'soccer.open': 'Open place',

    'tree.title': 'Tree',
    'tree.eyebrow': 'However far back it goes',
    'tree.intro':
      'Species I have some reason to care about, arranged by how they are actually related. Branch order comes from the Open Tree of Life; branch lengths mean nothing here. Click a named split to fold it away.',
    'tree.empty': 'Two species is the minimum for a tree. There are {n} so far.',

    'notfound.title': 'Not found',
    'notfound.back': 'Back home →',
  },
  zh: {
    'nav.albums': '唱片',
    'nav.games': '游戏',
    'nav.soccer': '足球',
    'nav.tree': '生命树',
    'nav.switch': 'EN',
    'nav.switchLabel': '切换到英文',

    'home.eyebrow': '个人存档',
    'home.albums': '常听不厌的唱片',
    'home.games': '喜爱的世界与冒险',
    'home.soccer': '印象最深的球员',
    'home.tree': '我认识的物种，按亲缘关系排列',

    'albums.title': '专辑与合辑',
    'albums.eyebrow': '循环播放',
    'albums.songs': '{n} 首',
    'albums.close': '关闭',

    'games.title': '游戏',
    'games.eyebrow': '玩过，记得',
    'games.steam': '在 Steam 上查看 ↗',
    'games.prev': '上一个',
    'games.next': '下一个',

    'soccer.title': '最难忘的十一人',
    'soccer.formation': '阵型',
    'soccer.squad': '比赛日名单',
    'soccer.subs': '替补',
    'soccer.places': '{n} 个席位',
    'soccer.open': '空位',

    'tree.title': '生命树',
    'tree.eyebrow': '无论追溯多远',
    'tree.intro':
      '我有理由在意的物种，按它们真实的亲缘关系排列。分支顺序来自 Open Tree of Life；分支的长短在这里没有意义。点击一个有名字的分叉可以把它折叠起来。',
    'tree.empty': '至少要两个物种才能成树，目前有 {n} 个。',

    'notfound.title': '页面不存在',
    'notfound.back': '返回首页 →',
  },
}

const STORAGE_KEY = 'qw-lang'

// The browser's language setting is what the reader chose, on the device they
// are holding — a far better guess than where their network happens to be.
// Once they touch the toggle, that choice wins for good.
function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'zh') return saved
  } catch {
    // Private mode or storage disabled: fall through to the browser setting.
  }
  return navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => STRINGS.en[key] ?? key,
})

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLanguage)

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  const value = useMemo(() => {
    const setLang = (next) => {
      setLangState(next)
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // Fine — it just will not stick across visits.
      }
    }
    const t = (key, vars = {}) => {
      const template = STRINGS[lang][key] ?? STRINGS.en[key] ?? key
      return template.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '')
    }
    return { lang, setLang, t }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}
