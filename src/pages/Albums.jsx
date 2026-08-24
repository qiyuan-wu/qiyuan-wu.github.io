import { useEffect, useState } from 'react'
import { ALBUMS } from '../albums.js'
import { useDocumentTitle } from '../useDocumentTitle.js'

const STORAGE_KEY = 'qw-liked-album-tracks'
const CHRONOLOGICAL_ALBUMS = [...ALBUMS].sort((a, b) => a.year - b.year)

function AlbumCover({ album, large = false }) {
  if (album.cover) {
    return (
      <img
        className="album-cover-image"
        src={album.cover}
        alt={`${album.title} by ${album.artist}`}
      />
    )
  }

  return (
    <div
      className={`album-cover-placeholder${large ? ' is-large' : ''}`}
      style={{ '--album-accent': album.accent }}
      aria-label={`${album.title} by ${album.artist}; cover artwork coming soon`}
      role="img"
    >
      <span className="cover-band-name">THE FLOWERS</span>
      <span className="cover-mark">花</span>
      <span className="cover-title">{album.title}</span>
      <span className="cover-year">{album.year}</span>
    </div>
  )
}

function readLikes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

export default function Albums() {
  useDocumentTitle('Albums · Qiyuan Wu')
  const [openAlbum, setOpenAlbum] = useState(null)
  const [likes, setLikes] = useState(readLikes)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likes))
  }, [likes])

  useEffect(() => {
    if (!openAlbum) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpenAlbum(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.classList.add('has-dialog')
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.classList.remove('has-dialog')
    }
  }, [openAlbum])

  const toggleTrack = (albumId, index) => {
    const key = `${albumId}:${index}`
    setLikes((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <section className="page-section albums-page">
      <div className="albums-heading">
        <p className="albums-eyebrow">On repeat</p>
        <h1>Favorite albums</h1>
      </div>

      <div className="record-shelf">
        <div className="record-row">
          {CHRONOLOGICAL_ALBUMS.map((album) => (
            <button
              className="record"
              key={album.id}
              type="button"
              onClick={() => setOpenAlbum(album)}
              aria-label={`Open ${album.title} by ${album.artist}`}
            >
              <span className="record-art">
                <AlbumCover album={album} />
              </span>
              <span className="record-info">
                <strong>{album.title}</strong>
                <span>{album.artist} · {album.year}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="shelf-edge" aria-hidden="true" />
      </div>

      {openAlbum && (
        <div className="album-dialog-backdrop" onMouseDown={() => setOpenAlbum(null)}>
          <div
            className="album-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="album-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="dialog-close"
              type="button"
              onClick={() => setOpenAlbum(null)}
              aria-label="Close album"
              autoFocus
            >
              ×
            </button>

            <div className="album-dialog-art">
              <AlbumCover album={openAlbum} large />
              <p>{openAlbum.edition}</p>
            </div>

            <div className="album-track-panel">
              <div className="album-dialog-title">
                <p>{openAlbum.artist}</p>
                <h2 id="album-dialog-title">{openAlbum.title}</h2>
                <span>{openAlbum.year} · {openAlbum.tracks.length} songs</span>
              </div>

              <ol className="track-list">
                {openAlbum.tracks.map((track, index) => {
                  const liked = Boolean(likes[`${openAlbum.id}:${index}`])
                  const trackTitle = typeof track === 'string' ? track : track.title
                  return (
                    <li className={liked ? 'is-liked' : ''} key={`${trackTitle}-${index}`}>
                      <span className="track-number">{String(index + 1).padStart(2, '0')}</span>
                      <span className="track-name">
                        <span>{trackTitle}</span>
                        {typeof track !== 'string' && <small>{track.artist}</small>}
                      </span>
                      <button
                        type="button"
                        className="track-like"
                        aria-label={`${liked ? 'Unmark' : 'Mark'} ${trackTitle} as a favorite`}
                        aria-pressed={liked}
                        onClick={() => toggleTrack(openAlbum.id, index)}
                      >
                        {liked ? '♥' : '♡'}
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
