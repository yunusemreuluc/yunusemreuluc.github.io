import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { asset, upper, useLang } from '../i18n';
import { EASE } from './fx';

/** End credits: the rows roll up as you scroll in, then the contact actions land. */
export default function Credits({ onReplay }: { onReplay: () => void }) {
  const { t, lang } = useLang();
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.15'] });
  const rollY = useTransform(scrollYProgress, [0, 1], ['40%', '0%']);
  const titleSpacing = useTransform(scrollYProgress, [0, 1], ['0.8em', '0.05em']);
  const titleOpacity = useTransform(scrollYProgress, [0.1, 0.8], [0, 1]);

  const rows = [
    { k: t.ui.starring, v: `${t.name} — ${t.role}` },
    ...t.seasons.map((s, i) => ({ k: `${t.ui.season} ${i + 1}`, v: s.title })),
    { k: t.ui.builtWith, v: t.stack.join(' · ') },
    { k: t.ui.basedIn, v: t.location },
    { k: t.ui.languages, v: t.spoken.join(' · ') },
  ];

  return (
    <section id="credits" ref={ref} className="credits" aria-labelledby="credits-title">
      <motion.h2 id="credits-title" className="credits-title" style={reduced ? undefined : { letterSpacing: titleSpacing, opacity: titleOpacity }}>
        {upper(t.ui.creditsTitle, lang)}
      </motion.h2>

      <motion.dl className="credit-rows" style={reduced ? undefined : { y: rollY }}>
        {rows.map((r, i) => (
          <motion.div key={r.k} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.05 }}>
            <dt>{r.k}</dt>
            <dd>{r.v}</dd>
          </motion.div>
        ))}
      </motion.dl>

      <motion.div
        className="actions actions-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.8, ease: EASE }}
      >
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
      </motion.div>
      {t.ui.pdfNote && <p className="note">{t.ui.pdfNote}</p>}

      <div className="replay">
        <a className="mono" href="#pilot">
          ↑ {t.ui.replay}
        </a>
        <button type="button" className="mono" onClick={onReplay}>
          ↺ {t.ui.replayIntro}
        </button>
      </div>

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} {t.name}
        </p>
        <p>{t.ui.licenseNote}</p>
      </footer>
    </section>
  );
}
