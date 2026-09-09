import { useEffect, useRef, useState } from 'react'
import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

// Draws every page of a PDF into the page as canvases. A plain <object> would
// be lighter, but whether it shows anything depends on the reader's browser
// settings — Chrome's "Download PDFs" leaves it blank — and phones mostly
// refuse. This works everywhere the site does.
export function PdfView({ src }) {
  const hostRef = useRef(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    const host = hostRef.current
    let doc = null
    let cancelled = false
    let raf = 0

    const render = async () => {
      if (!doc || !host) return
      host.replaceChildren()
      const width = host.clientWidth
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      for (let n = 1; n <= doc.numPages; n += 1) {
        const page = await doc.getPage(n)
        if (cancelled) return
        const base = page.getViewport({ scale: 1 })
        const scale = width / base.width
        const viewport = page.getViewport({ scale: scale * dpr })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.width = `${width}px`
        canvas.style.height = `${viewport.height / dpr}px`
        host.appendChild(canvas)
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
      }
    }

    pdfjs
      .getDocument({ url: src })
      .promise.then((loaded) => {
        if (cancelled) return
        doc = loaded
        setState('ready')
        return render()
      })
      .catch((error) => {
        console.error('PDF failed to load:', error)
        setState('failed')
      })

    // Re-rasterise when the column changes width; coalesce bursts of resizes.
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(render)
    })
    if (host) observer.observe(host)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      doc?.destroy()
    }
  }, [src])

  return (
    <div className={`pdf-view is-${state}`}>
      <div ref={hostRef} className="pdf-pages" />
    </div>
  )
}
