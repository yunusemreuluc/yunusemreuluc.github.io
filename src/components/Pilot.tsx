import { asset, useLang } from '../i18n';

/** The pilot episode: the resume summary, presented as what's on screen right now. */
export default function Pilot({ onPlay }: { onPlay: () => void }) {
  const { t } = useLang();
  const total = t.seasons.reduce((n, s) => n + s.episodes.length, 0);

  return (
    <section id="pilot" className="pilot" aria-labelledby="pilot-title">
      <div className="pilot-copy">
        <p className="eyebrow mono">
          S00E01 · {t.ui.pilot} · {t.ui.episodes(total)}
        </p>
        <h1 id="pilot-title" className="pilot-title">
          {t.name}
        </h1>
        <p className="pilot-role">{t.role}</p>
        {t.pilot.map((p) => (
          <p key={p.slice(0, 24)} className="pilot-text">
            {p}
          </p>
        ))}
        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={onPlay}>
            <span aria-hidden>▶</span> {t.ui.playAll}
          </button>
          <a className="btn" href={asset(t.cvFile)} download={t.cvFile}>
            <span aria-hidden>⤓</span> {t.ui.downloadCv}
          </a>
          <a className="btn btn-ghost" href="#credits">
            {t.ui.contact}
          </a>
        </div>
      </div>

      <figure className="screen">
        <div className="screen-glass">
          <img src={asset('yunus.jpg')} alt={t.photoAlt} width={400} height={400} />
          <span className="screen-rec mono" aria-hidden>
            <span className="lamp" /> REC
          </span>
          <span className="screen-tc mono" aria-hidden>
            00:00:01:00
          </span>
        </div>
        <figcaption className="screen-caption mono">
          {t.location} · {t.stack.join(' · ')}
        </figcaption>
      </figure>

      <dl className="highlights">
        {t.highlights.map((h) => (
          <div key={h.label}>
            <dt>{h.label}</dt>
            <dd>{h.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
