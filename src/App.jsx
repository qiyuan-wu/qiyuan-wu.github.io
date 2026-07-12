import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import { SEED_GAMES } from './games.js'
import { SortableGame } from './SortableGame.jsx'
import './App.css'

const STORAGE_KEY = 'qw-game-ranking-v1'

// Load the saved ranking order and reconcile it with the current seed list so
// that adding/removing seed games later doesn't break a saved order.
function loadRanking() {
  const byId = new Map(SEED_GAMES.map((g) => [g.id, g]))
  let savedIds = []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) savedIds = JSON.parse(raw)
  } catch {
    savedIds = []
  }

  const ordered = []
  const seen = new Set()
  // Keep saved order for games we still know about...
  for (const id of savedIds) {
    if (byId.has(id) && !seen.has(id)) {
      ordered.push(byId.get(id))
      seen.add(id)
    }
  }
  // ...then append any new seed games not yet in the saved order.
  for (const g of SEED_GAMES) {
    if (!seen.has(g.id)) ordered.push(g)
  }
  return ordered
}

export default function App() {
  const [games, setGames] = useState(loadRanking)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games.map((g) => g.id)))
  }, [games])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Small activation distance so a click/tap doesn't start a drag.
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setGames((items) => {
      const from = items.findIndex((g) => g.id === active.id)
      const to = items.findIndex((g) => g.id === over.id)
      return arrayMove(items, from, to)
    })
  }

  function resetRanking() {
    setGames(SEED_GAMES)
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Qiyuan Wu</h1>
        <p className="tagline">Games I love, ranked. Drag to reorder.</p>
      </header>

      <section className="ranking" aria-label="Game ranking">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={games.map((g) => g.id)}
            strategy={verticalListSortingStrategy}
          >
            <ol className="ranking-list">
              {games.map((game, index) => (
                <SortableGame key={game.id} game={game} rank={index + 1} />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      </section>

      <footer className="page-footer">
        <button type="button" className="reset-btn" onClick={resetRanking}>
          Reset order
        </button>
        <span className="hint">
          Your order is saved in this browser · Playtime &amp; cover art coming later
        </span>
      </footer>
    </main>
  )
}
