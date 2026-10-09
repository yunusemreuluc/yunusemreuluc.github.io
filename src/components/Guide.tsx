import { useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Cursor } from '../App';
import type { Episode } from '../content/types';
import { code, useLang } from '../i18n';

/** Episode guide: season tabs (resume sections, in order) and the episodes of the selected one. */
export default function Guide({ season, onSeason, onPlay }: { season: number; onSeason: (i: number) => void; onPlay: (c: Cursor) => void }) {
  const { t } = useLang();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const current = t.seasons[season];

  // Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation).
  const onKey = (e: KeyboardEvent) => {
    const last = t.seasons.length - 1;
    const to = { ArrowRight: season + 1, ArrowDown: season + 1, ArrowLeft: season - 1, ArrowUp: season - 1, Home: 0, End: last }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const next = (to + last + 1) % (last + 1);
    onSeason(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="guide" className="guide" aria-labelledby={`${base}-title`}>
      <div className="guide-head">
        <h2 id={`${base}-title`}>{t.ui.guideTitle}</h2>
        <p>{t.ui.guideIntro}</p>
      </div>

      <div className="tabs" role="tablist" aria-label={t.ui.seasonsLabel} onKeyDown={onKey}>
        {t.seasons.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            id={`${base}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === season}
            aria-controls={`${base}-panel`}
            tabIndex={i === season ? 0 : -1}
            onClick={() => onSeason(i)}
          >
            <span className="mono">
              {t.ui.season} {i + 1}
            </span>
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${season}`} className="panel" key={`${current.id}-${t.ui.langLabel}`}>
        <p className="panel-logline">
          <span className="mono">
            {t.ui.season} {season + 1} · {t.ui.episodes(current.episodes.length)}
          </span>
          {current.logline}
        </p>
        <ol className="episodes">
          {current.episodes.map((ep, i) => (
            <EpisodeRow key={ep.id} ep={ep} code={code(season, i)} onPlay={() => onPlay({ season, episode: i })} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function EpisodeRow({ ep, code, onPlay }: { ep: Episode; code: string; onPlay: () => void }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const hasDetails = Boolean(ep.points?.length || ep.metrics?.length || ep.link);

  return (
    <li className={`episode${open ? ' is-open' : ''}`}>
      <button type="button" className="episode-play" onClick={onPlay} aria-label={`${t.ui.play}: ${code} ${ep.title}`}>
        <span aria-hidden>▶</span>
      </button>
      <div className="episode-body">
        <p className="episode-meta mono">
          {code}
          {ep.date && <span> · {ep.date}</span>}
        </p>
        <h3>{ep.title}</h3>
        <p className="episode-tagline">{ep.tagline}</p>
        <p className="episode-summary">{ep.summary}</p>
        {ep.tags && (
          <ul className="chips">
            {ep.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
        {hasDetails && (
          <button type="button" className="episode-toggle" aria-expanded={open} aria-controls={detailsId} onClick={() => setOpen((o) => !o)}>
            {open ? t.ui.hideDetails : t.ui.details}
            <span aria-hidden>{open ? '−' : '+'}</span>
          </button>
        )}
        {hasDetails && (
          <div id={detailsId} className="episode-details" hidden={!open}>
            {ep.metrics && <Metrics items={ep.metrics} />}
            {ep.points && (
              <ul className="points">
                {ep.points.map((p) => (
                  <li key={p.slice(0, 32)}>{p}</li>
                ))}
              </ul>
            )}
            {ep.link && (
              <a className="ext" href={ep.link.href} target="_blank" rel="noreferrer">
                {ep.link.label} ↗
              </a>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export function Metrics({ items }: { items: { value: string; label: string }[] }) {
  return (
    <dl className="metrics">
      {items.map((m) => (
        <div key={m.label}>
          <dt>{m.label}</dt>
          <dd>{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}
