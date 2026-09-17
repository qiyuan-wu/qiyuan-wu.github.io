// The Caltech ME PhD, as routes through the catalog rather than a schedule.
// Each track is one interest, laid out as stages from foundation to frontier;
// arrows between courses follow the catalog's own prerequisites. Course
// details live in public/catalog.json (scripts/catalog.mjs regenerates it);
// this file only names courses, by any of their cross-listed departments.
// What is done, wanted or skipped lives in Firestore (see useCourses.js).

// Degree rules, from catalog.caltech.edu → Graduate options → ME.
export const DEGREE = {
  total: 195,
  candidacyTerm: 8,
  buckets: [
    {
      id: 'depth',
      name: 'ME core — depth',
      units: 36,
      rule: 'One track of the ME core; Thermal-Fluid Sciences here.',
    },
    {
      id: 'breadth',
      name: 'ME core — breadth',
      units: 18,
      rule: 'Any ME core track, the depth one included.',
    },
    {
      id: 'math',
      name: 'Advanced mathematics',
      units: 27,
      rule: 'ACM 101 or higher, CDS 232, Ma 108 or higher, Ph 129.',
    },
    {
      id: 'elective',
      name: 'Electives / minor',
      units: 54,
      rule: 'Engineering or science, 101 or above; no seminars or research.',
    },
    {
      id: 'seminar',
      name: 'Seminar',
      units: 6,
      rule: 'Six terms of AM/CE/ME 150 abc.',
    },
    {
      id: 'research',
      name: 'Research',
      units: 54,
      rule: 'ME 200 / Ae 200 and the like.',
    },
  ],
  milestones: [
    { term: 3, text: 'Adviser secured' },
    { term: 4, text: 'Thesis advisory committee formed (3 faculty, 2 from MCE)' },
    { term: 8, text: 'Oral candidacy exam — subject and research' },
    { term: 9, text: 'Coursework typically finished' },
  ],
}

// The ME core, per track, as the catalog lists it.
export const CORE = {
  fluids: [
    'ME 101', 'ME 105', 'APh 152', 'APh 153', 'ME 118', 'ME 119', 'ME 120', 'Ph 127',
    'ChE 164', 'ChE 165',
  ],
  solids: [
    'ME 102', 'Ae 104', 'AM 151', 'ME 160', 'Ae 165', 'ME 174', 'ME 213', 'ME 214', 'Ae 220',
    'Ae 221', 'ME 221', 'ME 223', 'ME 252', 'ME 266',
  ],
  controls: [
    'ME 129', 'CDS 131', 'ME 133', 'ME 134', 'CDS 141', 'CS 155', 'ME 169', 'CDS 212',
    'CDS 231', 'CDS 232', 'CDS 233', 'ME 234', 'ME 235',
  ],
}
export const DEPTH_TRACK = 'fluids'

// Humanities and social science never count toward the 195, so they show as
// "outside the degree" rather than in a bucket.
const HSS = new Set(['H', 'HPS', 'Pl', 'PS', 'Hum', 'En', 'L', 'VC', 'An', 'Ec', 'BEM', 'SS', 'Psy', 'Law', 'Mu', 'Art', 'F', 'Wr'])

export function bucketOf(course) {
  if (!course) return null
  const depts = course.label.split(' ')[0].split('/')
  const has = (ref) => sameCourse(course, ref)
  if (has('ME 150')) return 'seminar'
  if (CORE[DEPTH_TRACK].some(has)) return 'depth'
  if (Object.values(CORE).some((list) => list.some(has))) return 'breadth'
  if (
    (depts.includes('ACM') && course.number >= 101) ||
    (depts.includes('Ma') && course.number >= 108) ||
    has('CDS 232') ||
    has('Ph 129')
  )
    return 'math'
  if (depts.every((d) => HSS.has(d))) return 'hss'
  if (/seminar|colloquium|research|reading/i.test(course.title) || course.number >= 300) return null
  return 'elective'
}

// "ME 101" matches "Ae/APh/CE/ME 101 abc": same number, department in common.
export function sameCourse(course, ref) {
  const m = ref.match(/^([A-Za-z]+)\s+(\d+)/)
  if (!m) return false
  if (course.number !== Number(m[2])) return false
  const depts = [course.key, ...(course.aliases ?? [])].flatMap((k) => k.split(' ')[0].split('/'))
  return depts.includes(m[1])
}

export function findCourse(catalog, ref) {
  return catalog.find((c) => sameCourse(c, ref)) ?? null
}

export function unitsOf(course) {
  const n = Number(course.units.match(/(\d+)\s*units?/i)?.[1] ?? 0)
  return n * (course.parts || 1)
}

// The tracks. `stages` run left to right; a course's `after` names the
// courses in the same track it builds on, which draws the arrows. `why` is
// the one line that says what the course is for on this route.
export const TRACKS = [
  {
    id: 'fluids',
    name: 'Fluid mechanics',
    tagline: 'Theory, computation, and a door into the lab. This is the depth track.',
    color: '#6ea8fe',
    stages: [
      {
        name: 'Foundation',
        courses: [
          { ref: 'ME 101', why: 'The year-long core sequence everything in GALCIT assumes.' },
          { ref: 'ME 118', why: 'Thermodynamics; a prerequisite for Ae 201 and Ae 218.' },
        ],
      },
      {
        name: 'Theory',
        courses: [
          { ref: 'Ae 233', after: ['ME 101'], why: 'Stability — Orr–Sommerfeld, transient growth; the analytical heart of unsteady flow.' },
          { ref: 'Ae 201', after: ['ME 101', 'ME 118'], why: 'Compressible and kinetic-theory extensions of the core.' },
          { ref: 'ME 160', why: 'Continuum mechanics done properly: tensors, balance laws, both fluids and solids.' },
        ],
      },
      {
        name: 'Computation',
        courses: [
          { ref: 'Ae 232', after: ['ME 101'], why: 'CFD from Colonius and Meiron — the methods behind the immersed-layer work.' },
          { ref: 'Ae 239', after: ['Ae 233'], why: 'Turbulence, two terms; stability first is recommended.' },
        ],
      },
      {
        name: 'Experiment & frontier',
        courses: [
          { ref: 'Ae 104', after: ['ME 101'], why: 'Experimental methods with Dabiri and Austin — the open door to the lab.' },
          { ref: 'Ae 251', after: ['Ae 232', 'ME 101'], why: 'Closed-loop flow control: where fluids meets MPC. Alternate years.' },
          { ref: 'APh 152', why: 'Small-scale flows: streaming, surface tension, Stokes regimes.' },
          { ref: 'Ae 242', after: ['ME 101'], why: 'Biological propulsion — swimming and flying, Dabiri territory.' },
        ],
      },
    ],
  },
  {
    id: 'dynamics',
    name: 'Dynamical systems & control',
    tagline: 'From linear systems to nonlinear dynamics and the control theory behind UAV planning.',
    color: '#8ee0a1',
    stages: [
      {
        name: 'Foundation',
        courses: [
          { ref: 'ACM 104', why: 'Applied linear algebra; CDS 131 and Ae 232 both want it.' },
          { ref: 'ACM 107', after: ['ACM 104'], why: 'Linear analysis — the functional-analytic footing for CDS 232 and 231.' },
        ],
      },
      {
        name: 'Core',
        courses: [
          { ref: 'CDS 131', after: ['ACM 104'], why: 'Linear systems theory; gateway to every 200-level CDS course.' },
          { ref: 'CDS 232', after: ['ACM 107'], why: 'Nonlinear dynamics: Lyapunov, periodic orbits, Poincaré maps. Counts as math.' },
        ],
      },
      {
        name: 'Control',
        courses: [
          { ref: 'CDS 212', after: ['CDS 131'], why: 'Optimal control and RL — the theory under model predictive control.' },
          { ref: 'CDS 233', after: ['CDS 131', 'CDS 232'], why: 'Nonlinear control; feedback linearization and control Lyapunov functions.' },
          { ref: 'CDS 231', after: ['CDS 131', 'ACM 107'], why: 'Robust control; needs CMS 122 optimization too.' },
        ],
      },
      {
        name: 'Frontier',
        courses: [
          { ref: 'CDS 245', after: ['CDS 131', 'CDS 232'], why: 'Data-driven control, neural certificates. Alternate years.' },
          { ref: 'CDS 242', after: ['CDS 231', 'CDS 232'], why: 'Hybrid systems — legged robots, switching.' },
          { ref: 'ME 234', why: 'Advanced robotics: planning. Wants ME 133 or equivalent.' },
        ],
      },
    ],
  },
  {
    id: 'mechanics',
    name: 'Analytical & classical mechanics',
    tagline: 'Lagrangians, Hamiltonians and the variational view — the language shared by orbits, fluids and control.',
    color: '#ffcf6e',
    stages: [
      {
        name: 'Foundation',
        courses: [
          { ref: 'Ph 106', why: 'Ph 106a is the Lagrangian/Hamiltonian mechanics term; b and c are E&M.' },
        ],
      },
      {
        name: 'Variational',
        courses: [
          { ref: 'AM 127', why: 'Calculus of variations: Euler–Lagrange, Hamilton–Jacobi, applications to mechanics and control.' },
          { ref: 'AM 151', why: 'Dynamics and vibration: Lagrange’s equations for discrete systems, phase plane. Alternate years.' },
        ],
      },
      {
        name: 'Mathematical',
        courses: [
          { ref: 'Ma 148', after: ['Ph 106'], why: 'Mathematical physics: Hamiltonian formalism from the mathematicians’ side.' },
          { ref: 'Ma 147', after: ['Ma 108'], why: 'Dynamical systems incl. a Hamiltonian-dynamics term. Needs Ma 108; alternate years.' },
          { ref: 'HPS 171', why: 'History of mechanics, Galileo through Euler — the story behind the equations.' },
        ],
      },
    ],
  },
  {
    id: 'space',
    name: 'Orbital mechanics & mission design',
    tagline: 'Astrodynamics, navigation and how a planetary mission is actually put together.',
    color: '#d9a5ff',
    stages: [
      {
        name: 'Foundation',
        courses: [
          { ref: 'Ae 105', why: 'Space engineering: conic orbits, Lambert, invariant manifolds, flybys — then a build in b/c.' },
          { ref: 'Ge 103', why: 'The solar system, including orbital dynamics, chaos and tides.' },
        ],
      },
      {
        name: 'Dynamics',
        courses: [
          { ref: 'Ge 137', after: ['Ph 106'], why: 'Planetary physics with Batygin: resonances and chaos via Hamiltonian perturbation theory.' },
          { ref: 'Ge 133', why: 'How planetary systems form and evolve; pairs with 137.' },
        ],
      },
      {
        name: 'Missions',
        courses: [
          { ref: 'Ae 115', after: ['CDS 110'], why: 'Spacecraft navigation: orbit determination, Kalman filtering, DSN. Alternate years.' },
          { ref: 'Ge 110', why: 'Planetary mission formulation and design, taught with JPL.' },
          { ref: 'Ae 121', why: 'Space propulsion, three terms, from JPL’s Polk.' },
        ],
      },
    ],
  },
  {
    id: 'math',
    name: 'Differential equations & applied math',
    tagline: 'The 27 math units, chosen to feed the fluids and dynamics tracks.',
    color: '#ff9b85',
    stages: [
      {
        name: 'Methods',
        courses: [
          { ref: 'ACM 101', why: 'Methods of applied math with Bruno: asymptotics, complex analysis, PDE — Ae 201 wants it.' },
          { ref: 'ACM 106', why: 'Numerical methods with Hou; the prerequisite for ACM 210.' },
        ],
      },
      {
        name: 'Analysis',
        courses: [
          { ref: 'ACM 201', after: ['ACM 101'], why: 'PDE theory proper. Alternate years.' },
          { ref: 'Ma 142', after: ['Ma 108'], why: 'ODE and PDE from the math department; needs Ma 108.' },
          { ref: 'Ma 108', why: 'Classical analysis — the entry ticket to Ma 142 and Ma 147.' },
        ],
      },
      {
        name: 'Computation',
        courses: [
          { ref: 'ACM 210', after: ['ACM 106'], why: 'Numerical methods for PDEs. Alternate years.' },
        ],
      },
    ],
  },
  {
    id: 'data',
    name: 'Probability & data-driven fluids',
    tagline: 'Probability first, then stochastic processes, inference and learning — the footing for data-driven fluid mechanics.',
    color: '#c6e07a',
    stages: [
      {
        name: 'Foundation',
        courses: [
          { ref: 'ACM 116', why: 'Probability models with Zuev; the prerequisite nearly every course below names.' },
          { ref: 'ACM 104', why: 'Linear algebra again — ACM 117, 118 and 170 all lean on it.' },
        ],
      },
      {
        name: 'Probability',
        courses: [
          { ref: 'ACM 117', after: ['ACM 116', 'ACM 104'], why: 'Rigorous probability for computational math: concentration, nonasymptotic bounds.' },
          { ref: 'ACM 216', after: ['ACM 116'], why: 'Markov chains and stochastic processes with Owhadi — the language of SDEs and MCMC.' },
          { ref: 'Ma 140', why: 'Measure-theoretic probability, three terms: martingales, Brownian motion. Wants Ma 108b.' },
        ],
      },
      {
        name: 'Inference & learning',
        courses: [
          { ref: 'IDS 157', after: ['ACM 116'], why: 'Statistical inference — estimation, testing, Bayesian methods.' },
          { ref: 'ACM 118', after: ['ACM 116', 'ACM 117'], why: 'Gaussian processes and kernel methods with Owhadi; regression and learning of operators.' },
          { ref: 'IDS 158', after: ['IDS 157'], why: 'Statistical learning fundamentals. Alternate years.' },
          { ref: 'CS 155', why: 'Machine learning and data mining — the practical toolkit; on the controls core list.' },
        ],
      },
      {
        name: 'Data → fluids',
        courses: [
          { ref: 'ACM 154', after: ['ACM 116', 'IDS 157'], why: 'Inverse problems and data assimilation with Stuart — Kalman, ensemble and variational methods on PDEs.' },
          { ref: 'ACM 206', after: ['ACM 116', 'ACM 117'], why: 'Monte Carlo and MCMC for Bayesian inference and rare events. Alternate years.' },
          { ref: 'ACM 180', after: ['ACM 117'], why: 'Multiscale modeling: SDEs, Gaussian processes, homogenization. Alternate years.' },
          { ref: 'ACM 217', after: ['ACM 117'], why: 'Random matrix theory — the math under POD/DMD-style decompositions. Alternate years.' },
          { ref: 'EE 148', why: 'Deep learning from Perona; two terms, PyTorch in the second.' },
        ],
      },
    ],
  },
  {
    id: 'evolution',
    name: 'Evolution, phylogenetics & paleontology',
    tagline: 'Deep time from the biology and geology sides, plus its history.',
    color: '#7fd6c2',
    stages: [
      {
        name: 'Foundation',
        courses: [
          { ref: 'Bi 105', why: 'Evolution — the one course with the word in its title; by application, 15 seats.' },
          { ref: 'Ge 104', why: 'Geobiology: life and the rock record together.' },
        ],
      },
      {
        name: 'The record',
        courses: [
          { ref: 'Ge 112', after: ['Ge 104'], why: 'Sedimentology and stratigraphy with Grotzinger — how strata are read.' },
          { ref: 'Bi 158', after: ['Bi 105'], why: 'Vertebrate evolution incl. paleontology and development. Alternate years.' },
          { ref: 'Bi 160', after: ['Bi 105'], why: 'Molecular basis of animal evolution. Alternate years.' },
        ],
      },
      {
        name: 'Seminar & history',
        courses: [
          { ref: 'Ge 244', after: ['Ge 112'], why: 'Paleobiology seminar: classic and current papers.' },
          { ref: 'HPS 131', why: 'History of extinction.' },
          { ref: 'HPS 134', why: 'Birds, evolution, speciation and society.' },
          { ref: 'Ge 159', why: 'Astrobiology — life’s origins framed cosmically.' },
        ],
      },
    ],
  },
  {
    id: 'politics',
    name: 'Political philosophy & democracy',
    tagline: 'Caltech’s HSS is quantitative, so the philosophy lives in HPS/Pl and the democracy in PS and history.',
    color: '#f0b0c8',
    stages: [
      {
        name: 'Philosophy',
        courses: [
          { ref: 'Pl 138', why: 'Human nature and society: Plato, Locke, Rousseau, Marx — the political-philosophy course.' },
          { ref: 'HPS 120', why: 'Philosophy of science; how knowledge claims earn authority.' },
        ],
      },
      {
        name: 'Democracy & its rivals',
        courses: [
          { ref: 'PS 139', why: 'Comparative politics: institutions, development, democratic design. Alternate years.' },
          { ref: 'PS 125', why: 'Political conflict and violence.' },
          { ref: 'PS 129', why: 'Parties, partisanship and polarization in the US.' },
        ],
      },
      {
        name: 'History',
        courses: [
          { ref: 'H 125', why: 'Soviet Russia — authoritarianism as lived history. Alternate years.' },
          { ref: 'HPS 160', why: 'Scientists fleeing fascism; science under authoritarian states.' },
        ],
      },
    ],
  },
]

// Courses that belong to no track but round out the degree.
export const ALSO = [
  { ref: 'ME 150', why: 'The seminar requirement: six terms.' },
  { ref: 'Ae 208', why: 'GALCIT colloquium, one unit a term.' },
]
