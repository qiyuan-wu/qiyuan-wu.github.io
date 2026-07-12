import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// A single row in the ranking. The whole row is draggable, with an explicit
// grip handle for affordance and keyboard/screen-reader access.
export function SortableGame({ game, rank }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`game-row${isDragging ? ' is-dragging' : ''}`}
    >
      <span className="game-rank" aria-hidden="true">
        {rank}
      </span>

      <span className="game-cover" aria-hidden="true">
        {game.cover ? (
          <img src={game.cover} alt="" />
        ) : (
          <span className="cover-placeholder">{game.title.charAt(0)}</span>
        )}
      </span>

      <span className="game-info">
        <span className="game-title">{game.title}</span>
        <span className="game-year">{game.year}</span>
      </span>

      <button
        type="button"
        className="drag-handle"
        aria-label={`Reorder ${game.title}. Currently ranked ${rank}. Press space or enter, then use arrow keys.`}
        {...attributes}
        {...listeners}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="7" cy="5" r="1.4" fill="currentColor" />
          <circle cx="13" cy="5" r="1.4" fill="currentColor" />
          <circle cx="7" cy="10" r="1.4" fill="currentColor" />
          <circle cx="13" cy="10" r="1.4" fill="currentColor" />
          <circle cx="7" cy="15" r="1.4" fill="currentColor" />
          <circle cx="13" cy="15" r="1.4" fill="currentColor" />
        </svg>
      </button>
    </li>
  )
}
