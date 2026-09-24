import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useCourses } from '../useCourses.js'
import { CORE, DEPTH_TRACK, findCourse, partsOf } from '../courses.js'

// Every ME core subject, track by track, as the catalog lists them under the
// PhD requirements — each with a line on what it is actually about. Titles,
// units and terms come from public/catalog.json; the blurbs are mine.
const TRACK_INFO = {
  fluids: {
    name: 'Thermal-fluid sciences',
    color: '#6ea8fe',
    tagline: 'Fluid mechanics, thermodynamics, heat and mass transport, combustion.',
  },
  solids: {
    name: 'Mechanics of solids, structures and materials',
    color: '#ffcf6e',
    tagline: 'Continuum and structural mechanics, fracture, plasticity, waves and experiments.',
  },
  controls: {
    name: 'Robotics, controls and dynamics',
    color: '#8ee0a1',
    tagline: 'Linear and nonlinear control, optimal control, robotics and learning.',
  },
}

const BLURB = {
  // Thermal-fluid sciences
  'ME 101': 'The graduate fluids sequence: equations of motion, vorticity, potential flow, viscous and boundary-layer flow, compressible flow and an introduction to turbulence.',
  'ME 105': 'Thermodynamics and statistical mechanics of gases, liquids and solids, from classical equilibrium to phase transitions and ordered states.',
  'APh 152': 'Fluid flow in microsystems, where surface forces, capillarity and confinement dominate — the physics behind microfluidic devices.',
  'APh 153': 'Heat and mass transport in small, confined geometries: diffusion, thermal gradients and cooling at the micro scale.',
  'ME 118': 'Classical thermodynamics done carefully: the laws, entropy and available work, equations of state, potentials and phase equilibrium.',
  'ME 119': 'Conduction, convection in laminar and turbulent flow, phase change and thermal radiation.',
  'ME 120': 'Chemical kinetics and multicomponent transport applied to premixed and non-premixed flames, turbulent combustion and pollutants.',
  'Ph 127': 'Advanced statistical physics of interacting systems: phase transitions, broken symmetry, field theory and the renormalization group.',
  'ChE 164': 'Statistical thermodynamics from ensembles and partition functions to fluctuations, ideal gases, solids and phase transitions.',
  'ChE 165': 'The conceptual structure of thermodynamics: potentials, Legendre transforms, stability, metastability and mixtures.',
  // Mechanics of solids, structures and materials
  'ME 102': 'Graduate solid mechanics: continuum kinematics and balance laws, elasticity, waves, and rods, plates and shells.',
  'Ae 104': 'Designing experiments: transducers, optics, signal processing and noise, then hands-on labs in solid and fluid mechanics.',
  'AM 151': 'Lagrangian dynamics and vibration of discrete systems: modes, natural frequencies, damping and phase-plane analysis.',
  'ME 160': 'Continuum mechanics common to fluids and solids: tensors, deformation, balance laws and constitutive theory.',
  'Ae 165': 'Composite materials and laminates: stiffness, lamination theory, hygrothermal effects and failure.',
  'ME 174': 'How rocks deform and fail: elasticity, plasticity, creep, friction, localization and fluid interaction.',
  'ME 213': 'Brittle and ductile fracture, linking continuum fracture mechanics to the micromechanisms that drive it.',
  'ME 214': 'Large-deformation thin shells, buckling and localization, solved with finite elements and variational methods.',
  'Ae 220': 'Buckling and stability of structures: bifurcation, snap-through, imperfection sensitivity, plates and shells.',
  'Ae 221': 'How geometry drives structural performance, with tension and deployable structures for space.',
  'ME 221': 'Homogenization and effective properties of heterogeneous materials, up to metamaterials and band gaps.',
  'ME 223': 'Dislocation theory and the continuum theory of plasticity in crystals and metals.',
  'ME 252': 'Linear and nonlinear waves in continuous and periodic media, including recent work on structured materials.',
  'ME 266': 'Elastodynamics, dynamic fracture and frictional instabilities, applied to earthquakes and engineering failures.',
  // Robotics, controls and dynamics
  'ME 129': 'Hands-on robotics in Python: hardware interfaces, sensors and robust autonomous behaviors.',
  'CDS 131': 'State-space linear systems: stability, reachability, observability and feedback, with a first look at optimal control.',
  'ME 133': 'Core robotics: manipulator kinematics and dynamics in the first term, planning and navigation in the second.',
  'ME 134': 'Team projects building a full sense-think-act robot from hardware, kinematics, control and vision.',
  'CS 155': 'Machine learning and data mining in practice: models, optimization, generalization and modern methods.',
  'ME 169': 'Mobile robots built from the ground up in ROS: localization, mapping and collision-free planning.',
  'CDS 212': 'Optimal control and estimation: calculus of variations, HJB, Pontryagin, MPC, Kalman filtering and reinforcement learning.',
  'CDS 231': 'Robust control of large networked systems under limited sensing and actuation, via System Level Synthesis.',
  'CDS 232': 'Nonlinear ODEs from first principles: existence, Lyapunov stability, periodic orbits and Poincaré maps.',
  'CDS 233': 'Nonlinear control synthesis: feedback linearization, control Lyapunov and barrier functions, optimization-based controllers.',
  'ME 234': 'Advanced planning and navigation: SLAM, MDPs, receding-horizon and risk-aware planning, multi-robot coordination.',
  'ME 235': 'Robot kinematics from a Lie-algebraic view, robotic mechanisms, and grasping and manipulation.',
}

export default function CoreCourses() {
  useDocumentTitle('ME core · Qiyuan Wu')
  const { catalog } = useCourses()
  const courses = catalog?.courses ?? []

  if (!catalog) {
    return (
      <section className="page-section courses-page">
        <p className="courses-hint">Loading the catalog…</p>
      </section>
    )
  }

  return (
    <section className="page-section courses-page">
      <div className="section-head">
        <p className="page-eyebrow">Caltech · Mechanical Engineering PhD</p>
        <h1>ME core subjects</h1>
        <p className="section-sub">
          Every course that counts toward the 54-unit ME core: 36 units in a single track for
          depth, 18 more from any track for breadth. <Link to="/courses">← Courses</Link>
        </p>
      </div>

      {Object.entries(CORE).map(([id, refs]) => {
        const info = TRACK_INFO[id]
        const list = refs.map((code) => ({ code, course: findCourse(courses, code) }))
        return (
          <section key={id} className="courses-track" style={{ '--track': info.color }}>
            <header className="courses-track-head">
              <h2>{info.name}</h2>
              <span className="courses-track-meta">
                {list.length} courses{id === DEPTH_TRACK ? ' · my depth track' : ''}
              </span>
              <p>{info.tagline}</p>
            </header>
            <div className="core-grid">
              {list.map((c) => (
                <CoreCard key={c.code} {...c} />
              ))}
            </div>
          </section>
        )
      })}

      <p className="courses-hint courses-foot">
        From the {catalog.current} catalog’s ME PhD requirements. Dimmed courses are not offered{' '}
        {catalog.current}; click a course for the full catalog description.
      </p>
    </section>
  )
}

function CoreCard({ code, course }) {
  const [open, setOpen] = useState(false)
  if (!course) {
    return (
      <article className="courses-card">
        <div className="courses-card-main">
          <span className="courses-card-num">{code}</span>
          <span className="courses-card-why">{BLURB[code]}</span>
        </div>
      </article>
    )
  }
  const parts = partsOf(course)
  const terms = parts.length > 1
    ? parts.map((p) => `${p.part}:${p.term.join('/') || '?'}`).join(' ')
    : parts[0].term.join(' ')
  return (
    <article className={`courses-card${open ? ' is-open' : ''}${course.offered ? '' : ' is-off'}`}>
      <button type="button" className="courses-card-main" onClick={() => setOpen((o) => !o)}>
        <span className="courses-card-num">{course.label}</span>
        <span className="courses-card-title">{course.title}</span>
        <span className="courses-card-meta">
          {course.units.split(' (')[0]}
          {parts.length > 1 ? ` × ${parts.length}` : ''}
          {terms ? ` · ${terms}` : ''}
          {!course.offered ? ' · not this year' : ''}
        </span>
        <span className="courses-card-why">{BLURB[code]}</span>
      </button>
      {open && (
        <div className="courses-card-detail">
          <p>{course.desc}</p>
          {course.prereq && (
            <p>
              <b>Prerequisites.</b> {course.prereq}
            </p>
          )}
          {course.instructors && <p className="courses-dim">{course.instructors}</p>}
        </div>
      )}
    </article>
  )
}
