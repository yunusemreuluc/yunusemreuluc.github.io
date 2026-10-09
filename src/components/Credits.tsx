import { asset, useLang } from '../i18n';

/** End credits: who, what with, where — and how to get in touch. */
export default function Credits() {
  const { t } = useLang();
  const rows = [
    { k: t.ui.starring, v: `${t.name} — ${t.role}` },
    { k: t.ui.builtWith, v: t.stack.join(' · ') },
    { k: t.ui.basedIn, v: t.location },
    { k: t.ui.languages, v: t.spoken.join(' · ') },
  ];

  return (
    <section id="credits" className="credits" aria-labelledby="credits-title">
      <h2 id="credits-title" className="mono eyebrow">
        {t.ui.creditsTitle}
      </h2>
      <dl className="credit-rows">
        {rows.map((r) => (
          <div key={r.k}>
            <dt>{r.k}</dt>
            <dd>{r.v}</dd>
          </div>
        ))}
      </dl>

      <div className="actions actions-center">
        <a className="btn btn-primary" href={`mailto:${t.email}`}>
          {t.ui.email}: {t.email}
        </a>
        <a className="btn" href={t.links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn ↗
        </a>
        <a className="btn" href={t.links.github} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <a className="btn" href={asset(t.cvFile)} download={t.cvFile}>
          ⤓ {t.ui.downloadCv}
        </a>
      </div>
      {t.ui.pdfNote && <p className="note">{t.ui.pdfNote}</p>}

      <a className="replay mono" href="#pilot">
        ↺ {t.ui.replay}
      </a>

      <footer className="footer">
        <p>© {new Date().getFullYear()} {t.name}</p>
        <p>{t.ui.licenseNote}</p>
      </footer>
    </section>
  );
}
