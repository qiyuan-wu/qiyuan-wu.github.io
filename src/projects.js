// Projects, as a showcase: pictures and a line each, nothing to maintain.
// Images live in public/projects. A project can be flat (`images`) or split
// into `sections`, each with its own heading and images.
export const PROJECTS = [
  {
    id: 'ftc',
    title: 'FTC Robotics',
    years: '2018 – 2021',
    sections: [
      {
        heading: 'Rover Ruckus · Teams 6868 & 16117 · 2018–19',
        images: [
          { src: '/projects/ftc-2019-cad.jpg', caption: 'CAD in Fusion 360' },
          { src: '/projects/ftc-2019-rover.jpg', caption: 'The rover' },
          { src: '/projects/ftc-2019-arm.jpg', caption: 'Robot arm drawing' },
          { src: '/projects/ftc-2019-motors.jpg', caption: 'Motor placement' },
          { src: '/projects/ftc-2019-gamepad.jpg', caption: 'Gamepad controls' },
        ],
      },
      {
        heading: 'Skystone · Team 8515 · 2019–20',
        images: [{ src: '/projects/ftc-2020-robot.png', caption: 'The robot' }],
      },
      {
        heading: 'Ultimate Goal · Team 8515 · 2020–21',
        images: [
          { src: '/projects/ftc-2021-robot.jpg', caption: 'Full view' },
          { src: '/projects/ftc-2021-elevator.jpg', caption: 'Elevator' },
          { src: '/projects/ftc-2021-shooter.jpg', caption: 'Shooter' },
          { src: '/projects/ftc-2021-grabber.jpg', caption: 'Grabber' },
        ],
      },
    ],
  },
  {
    id: 'combat',
    title: 'Combat Robotics',
    images: [
      { src: '/projects/combat-before.jpg', caption: 'Before the competition' },
      { src: '/projects/combat-after.jpg', caption: 'After' },
    ],
  },
  {
    id: 'rapid',
    title: 'Project Rapid',
    images: [{ src: '/projects/rapid-1.png', caption: 'Satellite structure, CAD' }],
  },
  {
    id: 'trumpet',
    title: 'Automatic Trumpet',
    images: [
      { src: '/projects/trumpet-1.jpg', caption: 'Arduino and servos on a 3D-printed valve mount' },
      { src: '/projects/trumpet-2.jpg', caption: 'Mount drawing' },
    ],
  },
  {
    id: 'm1911',
    title: 'M1911 A1 Pistol',
    images: [
      { src: '/projects/m1911-model.png', caption: 'Partially complete model' },
      { src: '/projects/m1911-drawing.png', caption: 'Engineering drawing' },
      { src: '/projects/m1911-firing.gif', caption: 'Firing animation' },
    ],
  },
]
