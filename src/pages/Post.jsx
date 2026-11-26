import { Link, useParams } from 'react-router-dom'
import 'katex/dist/katex.min.css'
import { findPost, formatDate } from '../posts.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'
import NotFound from './NotFound.jsx'

export default function Post() {
  const { slug } = useParams()
  const post = findPost(slug)
  if (!post) return <NotFound />
  return <Article post={post} />
}

function Article({ post }) {
  const { lang, t } = useLanguage()
  useDocumentTitle(`${post.title} · ${t('site.name')}`)

  return (
    <article className="page-section blog-post">
      <header>
        <Link to="/blog" className="blog-back">
          {t('blog.back')}
        </Link>
        <h1>{post.title}</h1>
        <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
        {post.draft && <span className="blog-draft">{t('blog.draft')}</span>}
      </header>
      {/* The HTML is built from Markdown files in this repo, not from visitors. */}
      <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  )
}
