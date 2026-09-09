// Research, as a short showcase: a line or two, a couple of animations, and a
// link to the code. Media lives in public/research. Text is in i18n.jsx
// under `research.<id>.*`; the proper nouns here stay as written.
export const RESEARCH = [
  {
    id: 'lcs',
    years: '2024',
    where: 'SOFIA Laboratory, UCLA · Prof. Jeff Eldredge',
    media: [
      { src: '/research/lcs-ftle.gif', caption: 'FTLE field of a co-rotating vortex pair' },
      { src: '/research/lcs-lavd.png', caption: 'LAVD field around a pitching flat plate' },
    ],
    links: [
      { label: 'ILMPostProcessing.jl', href: 'https://github.com/JuliaIBPM/ILMPostProcessing.jl' },
      { label: 'Docs', href: 'https://JuliaIBPM.github.io/ILMPostProcessing.jl/dev' },
    ],
  },
  {
    id: 'uav',
    years: '2025 –',
    where: 'VECTR Laboratory, UCLA · Prof. Brett Lopez',
    media: [
      { src: '/research/uav-157a.gif', caption: 'Simulated 45° flip from the MAE 157A quadrotor' },
      { src: '/research/uav-mintime.gif', caption: 'Minimum-time trajectory vs. a polynomial one' },
    ],
    links: [
      { label: 'Stokes-Drifter-MAE-157A', href: 'https://github.com/qiyuanbillwu/Stokes-Drifter-MAE-157A' },
      { label: 'minimum-time-quadrotor-trajectory', href: 'https://github.com/qiyuanbillwu/minimum-time-quadrotor-trajectory' },
    ],
  },
  {
    id: 'streaming',
    years: '2024 –',
    where: 'SOFIA Laboratory, UCLA · Prof. Jeff Eldredge',
    media: [
      { src: '/research/vs-twocyl.gif', caption: 'A particle handed between two alternately oscillating cylinders' },
      { src: '/research/vs-cylinder.gif', caption: 'Mean particle path around an oscillating cylinder, Re = 40' },
    ],
    links: [
      { label: 'ViscousStreamingFEM', href: 'https://github.com/qiyuan-wu/ViscousStreamingFEM' },
    ],
  },
]
