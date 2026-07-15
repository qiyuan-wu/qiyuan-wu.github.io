import Pitch from '../Pitch.jsx'
import { useDocumentTitle } from '../useDocumentTitle.js'
import '../dreamXI.css'

export default function Soccer() {
  useDocumentTitle('Most Memorable XI · Qiyuan Wu')

  return (
    <section className="page-section dream-page">
      <div className="section-head">
        <h1>Most Memorable XI</h1>
      </div>

      <Pitch />
    </section>
  )
}
