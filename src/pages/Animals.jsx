import { useDocumentTitle } from '../useDocumentTitle.js'

export default function Animals() {
  useDocumentTitle('Animals · Qiyuan Wu')

  return (
    <section className="page-section">
      <div className="section-head">
        <h1>Animals</h1>
      </div>
    </section>
  )
}
