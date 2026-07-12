import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../useDocumentTitle.js'

export default function NotFound() {
  useDocumentTitle('Not found · Qiyuan Wu')

  return (
    <section className="page-section">
      <div className="section-head">
        <h1>Not found</h1>
      </div>
      <p style={{ textAlign: 'center' }}>
        <Link to="/" className="steam-link">
          Back home →
        </Link>
      </p>
    </section>
  )
}
