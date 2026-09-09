import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Every visitor-facing string on the site, in both languages. Data files
// (album titles, player names, game titles) are deliberately not here — they
// are proper nouns and stay as written. The owner-only editors stay English.
const STRINGS = {
  en: {
    'site.name': 'Qiyuan (Bill) Wu',
    'nav.home': 'Research',
    'nav.interests': 'Interests',
    'nav.projects': 'Old projects',
    'nav.guwen': '古文',
    'nav.albums': 'Albums',
    'nav.games': 'Games',
    'nav.soccer': 'Soccer',
    'nav.tree': 'Tree',
    'nav.switch': '中',
    'nav.switchLabel': 'Switch to Chinese',


    'projects.title': 'Old projects',
    'projects.sub': 'Robots and other things built before university.',
    'interests.sub': 'The rest of the site: what I read, listen to, play, and follow.',
    'cv.pdf': 'Download CV',
    'cv.research': 'Research',
    'cv.education': 'Education',
    'cv.presentations': 'Presentations',
    'cv.awards': 'Awards',
    'cv.activities': 'Activities',
    'home.interests': 'Interests',

    // DRAFT — written from the CV as a placeholder until the real one arrives.
    'bio.role': 'Ph.D. student in Mechanical Engineering, Caltech · from 2026',
    'bio.text':
      'I’m interested in unsteady flow physics and computation, as well as analytical mechanics and dynamical systems. Outside fluid mechanics, I’m interested in evolutionary biology.',

    'research.title': 'Research',
    'research.code': 'Code',
    'research.lcs.title': 'Lagrangian coherent structures',
    'research.lcs.text':
      'FTLE and LAVD fields for unsteady flows computed with the immersed layers method, used to find transport barriers and to pull the leading-edge vortex out of a pitching plate. Shipped as part of ILMPostProcessing.jl.',
    'research.uav.title': 'Quadrotor trajectory optimization',
    'research.uav.text':
      'Started as the MAE 157A capstone — a quadrotor built from CAD up, flying minimum-snap trajectories — and became direct-collocation optimal control: minimum-time maneuvers solved with IPOPT, and waypoint timing tuned by gradient descent.',
    'research.streaming.title': 'Viscous streaming',
    'research.streaming.text':
      'Oscillating bodies drive a steady mean flow that traps and carries inertial particles. Recasting the equations in time-harmonic form and solving them with finite elements predicts the mean particle paths without marching through the oscillations. M.S. thesis, 2026.',

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
    'tree.all': 'All life',
    'tree.missing': 'No such tree.',
    'tree.empty': 'Two species is the minimum for a tree. There are {n} so far.',

    'notfound.title': 'Not found',
    'notfound.back': 'Back home →',
  },
  zh: {
    'site.name': '吴其远',
    'nav.home': '研究',
    'nav.interests': '兴趣',
    'nav.projects': '旧项目',
    'nav.guwen': '古文',
    'nav.albums': '唱片',
    'nav.games': '游戏',
    'nav.soccer': '足球',
    'nav.tree': '演化树',
    'nav.switch': 'EN',
    'nav.switchLabel': '切换到英文',


    'projects.title': '旧项目',
    'projects.sub': '上大学之前做的机器人和其他东西。',
    'interests.sub': '网站的其余部分：读的、听的、玩的、看的。',
    'cv.pdf': '下载简历',
    'cv.research': '研究',
    'cv.education': '教育',
    'cv.presentations': '报告',
    'cv.awards': '奖项',
    'cv.activities': '活动',
    'home.interests': '兴趣',

    // 草稿 — 由简历改写的占位文字，等正式版。
    'bio.role': '加州理工学院 机械工程博士生 · 2026 年起',
    'bio.text':
      '我关注非定常流动的物理与计算，也关注分析力学与动力系统。流体力学之外，我对演化生物学感兴趣。',

    'research.title': '研究',
    'research.code': '代码',
    'research.lcs.title': '拉格朗日拟序结构',
    'research.lcs.text':
      '用浸入层方法计算非定常流动的 FTLE 与 LAVD 场，识别输运屏障，并从俯仰平板的流场中提取前缘涡。成果并入 ILMPostProcessing.jl。',
    'research.uav.title': '四旋翼轨迹优化',
    'research.uav.text':
      '始于 MAE 157A 课程设计——从 CAD 开始造一架四旋翼，飞最小 snap 轨迹——后来发展为直接配点法最优控制：用 IPOPT 求解最短时间机动，用梯度下降调航点时间分配。',
    'research.streaming.title': '粘性声流',
    'research.streaming.text':
      '振荡物体驱动稳定的平均流，能捕获并输运惯性颗粒。把方程改写成时谐形式并用有限元求解，不必逐周期推进即可预测颗粒的平均轨迹。硕士论文，2026。',

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
    'tree.all': '全部',
    'tree.missing': '没有这棵树。',
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
