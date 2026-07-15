import PlayerCard from './PlayerCard.jsx'
import { PLAYERS } from './dreamXI.js'

// The pitch, its markings, and the eleven cards laid out on it, in a broadcast
// perspective (the ground plane tilts back; cards billboard upright).
//
// Markings are an original SVG (center circle, halfway line, penalty + goal
// boxes, corner arcs). Cards are positioned by percent from the data file.
export default function Pitch() {
  return (
    <div className="pitch-scene pitch-scene--angled">
      <div className="pitch-plane">
        <PitchMarkings />
        <div className="pitch-players">
          {PLAYERS.map((player) => (
            <div
              className="pitch-slot"
              key={player.id}
              style={{ left: `${player.x}%`, top: `${player.y}%` }}
            >
              <PlayerCard player={player} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// viewBox is 100 wide × 150 tall (a 2:3 pitch). Attacking end is at the top
// (y small), own goal at the bottom (y large) — matching the data's y axis.
function PitchMarkings() {
  return (
    <svg
      className="pitch-lines"
      viewBox="0 0 100 150"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* outer boundary */}
      <rect x="2" y="2" width="96" height="146" rx="1.5" />
      {/* halfway line */}
      <line x1="2" y1="75" x2="98" y2="75" />
      {/* center circle + spot */}
      <circle cx="50" cy="75" r="12" />
      <circle cx="50" cy="75" r="0.9" className="pitch-spot" />

      {/* top (attacking) penalty area */}
      <rect x="24" y="2" width="52" height="22" />
      <rect x="38" y="2" width="24" height="9" />
      <circle cx="50" cy="17" r="0.9" className="pitch-spot" />
      <path d="M40 24 A12 12 0 0 0 60 24" />

      {/* bottom (own) penalty area */}
      <rect x="24" y="126" width="52" height="22" />
      <rect x="38" y="139" width="24" height="9" />
      <circle cx="50" cy="133" r="0.9" className="pitch-spot" />
      <path d="M40 126 A12 12 0 0 1 60 126" />

      {/* corner arcs */}
      <path d="M2 4.5 A2.5 2.5 0 0 1 4.5 2" />
      <path d="M95.5 2 A2.5 2.5 0 0 1 98 4.5" />
      <path d="M4.5 148 A2.5 2.5 0 0 1 2 145.5" />
      <path d="M98 145.5 A2.5 2.5 0 0 1 95.5 148" />
    </svg>
  )
}
