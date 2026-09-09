import { useEffect, useState } from 'react'
import { PROJECTS } from '../projects.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'

function Gallery({ images, onOpen }) {
  return (
    <div className="project-gallery">
      {images.map((image) => (
        <figure key={image.src}>
          <button type="button" onClick={() => onOpen(image)} aria-label={image.caption}>
            <img src={image.src} alt={image.caption} loading="lazy" />
          </button>
          <figcaption>{image.caption}</figcaption>
        </figure>
      ))}
    </div>
  )
}

export default function Projects() {
  const { t } = useLanguage()
  useDocumentTitle(`${t('projects.title')} · ${t('site.name')}`)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('has-dialog')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('has-dialog')
    }
  }, [open])

  return (
    <section className="page-section projects-page">
      <div className="section-head">
        <h1>{t('projects.title')}</h1>
        <p className="section-sub">{t('projects.sub')}</p>
      </div>

      {PROJECTS.map((project) => (
        <article key={project.id} className="project">
          <header className="project-head">
            <h2>{project.title}</h2>
            {project.years && <span>{project.years}</span>}
          </header>
          <div className="project-body">
            {project.sections ? (
              project.sections.map((section) => (
                <div key={section.heading} className="project-section">
                  <h3>{section.heading}</h3>
                  <Gallery images={section.images} onOpen={setOpen} />
                </div>
              ))
            ) : (
              <Gallery images={project.images} onOpen={setOpen} />
            )}
          </div>
        </article>
      ))}

      {open && (
        <div className="lightbox" onMouseDown={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.caption}>
          <img src={open.src} alt={open.caption} onMouseDown={(event) => event.stopPropagation()} />
          <p>{open.caption}</p>
        </div>
      )}
    </section>
  )
}
