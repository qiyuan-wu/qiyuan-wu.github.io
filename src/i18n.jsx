import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Every visitor-facing string on the site, in both languages. Data files
// (album titles, player names, game titles) are deliberately not here — they
// are proper nouns and stay as written. The owner-only editors stay English.
const STRINGS = {
  en: {
    'site.name': 'Qiyuan Wu',
    'nav.cv': 'CV',
    'nav.projects': 'Projects',
    'nav.guwen': '古文',
    'nav.albums': 'Albums',
    'nav.games': 'Games',
    'nav.soccer': 'Soccer',
    'nav.tree': 'Tree',
    'nav.switch': '中',
    'nav.switchLabel': 'Switch to Chinese',


    'projects.title': 'Projects',
    'cv.title': 'CV',
    'cv.pdf': 'Download PDF',

    'albums.title': 'Albums + comps',
    'albums.songs': '{n} songs',
    'albums.close': 'Close album',

    'games.title': 'Games',
    'games.steam': 'View on Steam ↗',
    'games.prev': 'Previous game',
    'games.next': 'Next game',

    'soccer.title': 'Most Memorable XI',
    'soccer.subs': 'Substitutes',
    'soccer.places': '{n} places',
    'soccer.open': 'Open place',

    'tree.title': 'Tree',
    'tree.empty': 'Two species is the minimum for a tree. There are {n} so far.',

    'notfound.title': 'Not found',
    'notfound.back': 'Back home →',
  },
  zh: {
    'site.name': '吴其远',
    'nav.cv': '简历',
    'nav.projects': '项目',
    'nav.guwen': '古文',
    'nav.albums': '唱片',
    'nav.games': '游戏',
    'nav.soccer': '足球',
    'nav.tree': '演化树',
    'nav.switch': 'EN',
    'nav.switchLabel': '切换到英文',


    'projects.title': '项目',
    'cv.title': '简历',
    'cv.pdf': '下载 PDF',

    'albums.title': '专辑与合辑',
    'albums.songs': '{n} 首',
    'albums.close': '关闭',

    'games.title': '游戏',
    'games.steam': '在 Steam 上查看 ↗',
    'games.prev': '上一个',
    'games.next': '下一个',

    'soccer.title': '十一人',
    'soccer.subs': '替补',
    'soccer.places': '{n} 个席位',
    'soccer.open': '空位',

    'tree.title': '演化树',
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
