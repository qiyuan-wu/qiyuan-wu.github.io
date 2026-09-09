import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { PERIODS } from "../guwen.js";
import { useDocumentTitle } from "../useDocumentTitle.js";
import { useLanguage } from "../i18n.jsx";

// A `(… 一作：…)` or `(具 通：俱)` aside is an editor's note, not the text.
// It stays where it was but steps back so the line reads through it.
const NOTE = /([(（][^()（）]*(?:一作|通)[:：][^()（）]*[)）])/g;
const IS_NOTE = /^[(（][^()（）]*(?:一作|通)[:：]/;

function Line({ text, verse }) {
  const parts = text.split(NOTE);
  const notes = parts.filter((part) => IS_NOTE.test(part));
  return (
    <>
      {/* A centered verse line is thrown off by the note hanging on its end, so
          balance it with an invisible copy on the other side. */}
      {verse && notes.length > 0 && (
        <small className="guwen-note guwen-note-ghost" aria-hidden="true">
          {notes.join("")}
        </small>
      )}
      {parts.map((part, index) =>
        IS_NOTE.test(part) ? (
          <small key={index} className="guwen-note">
            {part}
          </small>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

// Verse comes one short line at a time and wants each line on its own; prose
// comes in paragraphs and wants an indent. Average line length tells them apart.
function isVerse(body) {
  const average =
    body.reduce((sum, line) => sum + line.length, 0) / body.length;
  return average < 40;
}

export default function Guwen() {
  const { t } = useLanguage();
  useDocumentTitle(`${t("nav.guwen")} · ${t("site.name")}`);
  const [params, setParams] = useSearchParams();

  const withPieces = PERIODS.filter((p) => p.authors.length);
  const requested = PERIODS.find((p) => p.id === params.get("p"));
  const current = requested?.authors.length ? requested : withPieces[0];
  const author =
    current?.authors.find((a) => a.name === params.get("a")) ?? null;
  // An author with a single piece has nothing to choose from, so opening the
  // author opens the piece; a longer list still waits for a title.
  const piece =
    author?.pieces.find((x) => x.title === params.get("t")) ??
    (author?.pieces.length === 1 ? author.pieces[0] : null);
  const activeRef = useRef(null);
  const readingRef = useRef(null);

  // Everything lives in the URL, so a period, an author, or a single piece can
  // be linked to directly; each level replaces the ones below it.
  const go = (next) => {
    const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    setParams(clean);
  };

  // On a phone the line is wider than the screen; bring the chosen period into
  // view so a deep link to 宋 does not open on 先秦.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [current?.id]);

  useEffect(() => {
    if (piece)
      readingRef.current?.scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
  }, [piece]);

  return (
    <section className="page-section guwen-page" lang="zh-CN">
      <div className="section-head">
        <h1>{t("nav.guwen")}</h1>
      </div>

      <nav className="timeline" aria-label="朝代">
        <ol>
          {PERIODS.map((period) => {
            const empty = !period.authors.length;
            const active = period.id === current?.id;
            const count = period.authors.reduce(
              (n, a) => n + a.pieces.length,
              0,
            );
            return (
              <li
                key={period.id}
                className={`timeline-node${empty ? " is-empty" : ""}${active ? " is-active" : ""}`}
              >
                <button
                  ref={active ? activeRef : undefined}
                  type="button"
                  disabled={empty}
                  aria-current={active ? "true" : undefined}
                  onClick={() => go({ p: period.id })}
                >
                  <span className="timeline-dot" aria-hidden="true" />
                  <span className="timeline-name">{period.name}</span>
                  <span className="timeline-span">{period.span}</span>
                  {!empty && <span className="timeline-count">{count}</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {current && (
        <div className="guwen-authors" key={current.id}>
          {current.authors.map((a) => {
            const open = a.name === author?.name;
            return (
              <article
                key={a.name}
                className={`guwen-author${open ? " is-open" : ""}`}
              >
                <button
                  type="button"
                  className="guwen-author-head"
                  aria-expanded={open}
                  onClick={() => go({ p: current.id, a: open ? "" : a.name })}
                >
                  <span className="guwen-author-name">{a.name}</span>
                  <span className="guwen-author-dates">{a.dates}</span>
                  <span className="guwen-author-count">
                    {a.pieces.length} 篇
                  </span>
                </button>
                {open && a.pieces.length > 1 && (
                  <ul className="guwen-titles">
                    {a.pieces.map((x) => (
                      <li key={x.title}>
                        <button
                          type="button"
                          className={
                            x.title === piece?.title ? "is-active" : ""
                          }
                          onClick={() =>
                            go({ p: current.id, a: a.name, t: x.title })
                          }
                        >
                          {x.title}
                          {x.subtitle && <small>{x.subtitle}</small>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      )}

      {piece &&
        (() => {
          const verse = isVerse(piece.body);
          return (
            <article
              ref={readingRef}
              key={piece.title}
              className={`guwen-piece${verse ? " is-verse" : " is-prose"}`}
            >
              <h2>{piece.title}</h2>
              <p className="guwen-byline">
                {author.name}
                {piece.subtitle && ` · ${piece.subtitle}`}
              </p>
              <div className="guwen-body">
                {piece.body.map((line, index) => (
                  <p key={index}>
                    <Line text={line} verse={verse} />
                  </p>
                ))}
              </div>
              <p className="guwen-close">
                <button
                  type="button"
                  onClick={() =>
                    go(
                      author.pieces.length > 1
                        ? { p: current.id, a: author.name }
                        : { p: current.id },
                    )
                  }
                >
                  收起
                </button>
              </p>
            </article>
          );
        })()}
    </section>
  );
}
