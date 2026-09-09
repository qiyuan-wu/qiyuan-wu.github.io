// The CV, as data. Mirrors the PDF in public/Qiyuan_Wu_CV.pdf; update both
// together. No phone number on purpose — this is a public page.
export const CV = {
  name: 'Qiyuan Wu',
  contact: [
    { label: 'GitHub', href: 'https://github.com/qiyuanbillwu', text: 'qiyuanbillwu' },
    { label: 'Email', href: 'mailto:billwu67@ucla.edu', text: 'billwu67@ucla.edu' },
  ],
  pdf: '/Qiyuan_Wu_CV.pdf',

  education: [
    {
      years: '2024 – Present',
      school: 'University of California, Los Angeles',
      degree: 'M.S. in Aerospace Engineering — Departmental Scholar',
      note: 'GPA 3.96 / 4.0',
    },
    {
      years: '2021 – Present',
      school: 'University of California, Los Angeles',
      degree: 'B.S. in Aerospace Engineering, double major in Applied Mathematics',
      note: 'GPA 3.96 / 4.0',
    },
  ],

  research: [
    {
      title: 'Viscous Streaming',
      where: 'The SOFIA Laboratory, UCLA · Advisor: Prof. Jeff Eldredge',
      when: 'Dec 2024 – Present',
      points: [
        'Developing a computational framework for mean particle trajectories in viscous streaming flows over various geometries.',
        'Simplified the Navier–Stokes equations via small-amplitude expansion.',
        'Applied generalized Lagrangian mean theory to derive mean transport equations.',
        'Optimized computational efficiency by solving in the frequency domain.',
        'Solved partial differential equations using the Immersed Layers Method.',
      ],
    },
    {
      title: 'Autonomous UAV Motion Planning',
      where: 'VECTR Laboratory, UCLA · Advisor: Prof. Brett Lopez',
      when: 'June 2025 – Present',
      points: [
        'Investigating aerodynamic-aware model predictive control of quadrotors.',
        'Bridging unsteady fluid dynamics, receding-horizon control, and LCS for energy-efficient UAV motion planning.',
        'Optimized waypoint-based minimum-snap trajectories using gradient descent.',
        'Designed and implemented a framework for quadrotor planning, dynamics, control, and simulation.',
      ],
    },
    {
      title: 'Lagrangian Coherent Structures (LCS)',
      where: 'The SOFIA Laboratory, UCLA · Advisor: Prof. Jeff Eldredge',
      when: 'June 2024 – Dec 2024',
      points: [
        'Developed a computational framework for FTLE and LAVD fields to identify unsteady transport barriers in complex flows.',
        'Characterized unsteady saddle points using the FTLE field.',
        'Extracted the leading-edge vortex of a pitching flat plate using the LAVD field.',
        'Developed an open-source Julia package for FTLE/LAVD field computations (ILMPostProcessing.jl).',
      ],
    },
    {
      title: 'Acoustically Coupled Combustion Instabilities',
      where: 'Energy and Propulsion Research Laboratory, UCLA · Advisor: Prof. Ann Karagozian',
      when: 'June 2024 – Sep 2024',
      points: [
        'Investigated flame dynamics of single and coaxial methane diffusion jets at the pressure antinode of a standing acoustic wave.',
        'Captured high-speed flame responses across varied jet geometries, Reynolds numbers, frequencies, and pressure amplitudes.',
        'Classified flame dynamics into sustained oscillatory combustion, periodic lift-off and reattachment, permanent lift-off, and blowoff using POD analysis.',
      ],
    },
  ],

  presentations: [
    {
      text: 'Q. Wu. “Numerical Solution of Flow Past an Oscillating Cylinder Using the Immersed Layers Method.” Undergraduate Research Week, UCLA, May 2025.',
      note: 'Poster',
    },
    {
      text: 'A. Hayrapetyan, D. Oviedo, Q. Wu, and A. Karagozian. “Acoustically Coupled Single and Coaxial Fuel Jet Combustion at a Pressure Antinode.” APS Division of Fluid Dynamics Meeting Abstracts, P34.004, November 2024.',
      note: 'Co-author; presented by A. Hayrapetyan',
    },
    {
      text: 'Q. Wu. “MLP-based Aerodynamic Coefficient Estimation of Flat Plate Airfoil in Transverse Gust.” MECH&AE 252E, Data Science for Fluid Dynamics, UCLA, June 2024.',
      note: 'Course project',
    },
  ],

  coursework: [
    {
      title: 'Incompressible CFD with the Immersed-Boundary Projection Method',
      points: [
        'Simulated lid-driven cavity flows (Re = 400, 1000); validated solver convergence on a staggered grid.',
        'Modeled flow past a cylinder with the discrete forcing approach.',
      ],
    },
    {
      title: 'Numerical Simulation of Supersonic Flow past a Cylinder',
      points: [
        'Implemented Lax–Friedrichs and Steger–Warming schemes for Mach 4 cylinder flow.',
        'Validated pressure and Mach contours and bow shock location across grid resolutions.',
      ],
    },
  ],

  awards: [
    { title: 'Energy and Propulsion Research Laboratory Summer Scholarship', where: 'Department of Mechanical and Aerospace Engineering, UCLA', when: 'June 2024' },
    { title: 'Departmental Scholar Program', where: 'Department of Mechanical and Aerospace Engineering, UCLA', when: '2024 – Present' },
    { title: 'Dean’s Honors List', where: 'UCLA', when: '2021 – Present' },
  ],

  activities: [
    {
      title: 'CruX at UCLA — Technical Vice President (2023 – 2024)',
      when: '2021 – 2024',
      points: [
        'Designed a workshop series on building brain-computer interfaces.',
        'Led workshops for over 90 students on signal processing and machine learning in Python.',
        'Contributed to a BCI speller enabling brainwave-based typing; 1st place, 2023 California Neurotechnology Conference.',
      ],
    },
    {
      title: 'California Wildlife Center — Marine Mammal Rehabilitation Volunteer',
      when: '2022 – Present',
      points: ['Rescued and rehabilitated over 100 sea lions, elephant seals, and other marine animals.'],
    },
  ],
}
