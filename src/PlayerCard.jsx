// A player on the pitch. Filled slots show the downloaded card image as-is
// (the image is the whole card). Empty slots render a dashed placeholder.
export default function PlayerCard({ player }) {
  if (player.image) {
    return (
      <img
        className="fut-cardimg"
        src={player.image}
        alt={player.name ? `${player.name} — ${player.pos}` : player.pos}
        draggable="false"
      />
    )
  }

  return (
    <article className="fut-card--empty" aria-label={`Empty ${player.pos} slot`}>
      <span className="fut-empty-pos">{player.pos}</span>
      <span className="fut-empty-plus" aria-hidden="true">+</span>
      <span className="fut-empty-hint">Add a player</span>
    </article>
  )
}
