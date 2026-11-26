import { Link } from 'react-router-dom'
import { POSTS, formatDate } from '../posts.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'

export default function Blog() {
  const { lang, t } = useLanguage()
  useDocumentTitle(`${t('nav.blog')} · ${t('site.name')}`)

  return (
    <section className="page-section blog">
      <div className="section-head">
        <h1>{t('blog.title')}</h1>
      </div>
      {POSTS.length === 0 ? (
        <p className="placeholder">{t('blog.empty')}</p>
      ) : (
        <ol className="blog-list">
          {POSTS.map((post) => (
            <li key={post.slug}>
              <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
              <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              {post.draft && <span className="blog-draft">{t('blog.draft')}</span>}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
