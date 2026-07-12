import { useState, useCallback } from 'react'
import { GAMES, bannerUrl, storeUrl } from './games.js'

// Map an item's distance from the active (center) item to a position class.
// Center is big; ±1 are the two smaller banners tucked to each side; ±2 peek
// faintly further out; anything beyond is hidden.
function positionClass(offset) {
  switch (offset) {
    case 0:
      return 'is-center'
    case -1:
      return 'is-left-1'
    case 1:
      return 'is-right-1'
    case -2:
      return 'is-left-2'
    case 2:
      return 'is-right-2'
    default:
      return 'is-hidden'
  }
}

export function BannerGallery() {
  const [active, setActive] = useState(0)
  const count = GAMES.length

  const go = useCallback(
    (next) => setActive(() => Math.max(0, Math.min(count - 1, next))),
    [count],
  )

  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      go(active - 1)
      e.preventDefault()
    } else if (e.key === 'ArrowRight') {
      go(active + 1)
      e.preventDefault()
    }
  }

  const current = GAMES[active]

  return (
    <section
      className="gallery"
      aria-roledescription="carousel"
      aria-label="Games I love"
      onKeyDown={handleKeyDown}
    >
      <div className="gallery-stage">
        {GAMES.map((game, i) => {
          const offset = i - active
          const isCenter = offset === 0
          const focusable = Math.abs(offset) <= 1
          return (
            <button
              key={game.id}
              type="button"
              className={`banner ${positionClass(offset)}`}
              tabIndex={focusable ? 0 : -1}
              aria-hidden={Math.abs(offset) > 2 ? true : undefined}
              aria-label={
                isCenter
                  ? `${game.title}, ${game.year}. Open on Steam`
                  : `${game.title}. Bring to front`
              }
              onClick={() =>
                isCenter
                  ? window.open(storeUrl(game.appid), '_blank', 'noopener')
                  : setActive(i)
              }
            >
              {/* Fallback title sits behind the image; if the CDN art fails to
                  load we hide the <img> and this shows through. */}
              <span className="banner-fallback">{game.title}</span>
              <img
                src={game.image || bannerUrl(game.appid)}
                alt={game.title}
                draggable="false"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </button>
          )
        })}
      </div>

      <button
        className="gallery-nav prev"
        type="button"
        onClick={() => go(active - 1)}
        disabled={active === 0}
        aria-label="Previous game"
      >
        ‹
      </button>
      <button
        className="gallery-nav next"
        type="button"
        onClick={() => go(active + 1)}
        disabled={active === count - 1}
        aria-label="Next game"
      >
        ›
      </button>

      <div className="gallery-caption">
        <h2>{current.title}</h2>
        <p>
          <span className="year">{current.year}</span>
          <a
            className="steam-link"
            href={storeUrl(current.appid)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Steam ↗
          </a>
        </p>
      </div>

      <div className="gallery-dots" role="tablist" aria-label="Choose a game">
        {GAMES.map((game, i) => (
          <button
            key={game.id}
            type="button"
            role="tab"
            className={`dot${i === active ? ' is-active' : ''}`}
            aria-label={game.title}
            aria-selected={i === active}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </section>
  )
}
