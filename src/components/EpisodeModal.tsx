import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Cursor } from '../App';
import { useDialog } from '../hooks/useDialog';
import { code, useLang } from '../i18n';
import { EASE, Metrics, PosterArt } from './fx';

const block = {
  hidden: { opacity: 0, y: 22, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE } },
};

/** Episode detail. The poster grows into the header through a shared-layout transition. */
export default function EpisodeModal({ at, onClose, onMove, onPlay }: { at: Cursor; onClose: () => void; onMove: (c: Cursor) => void; onPlay: (c: Cursor) => void }) {
  const { t } = useLang();
  const root = useRef<HTMLDivElement>(null);
  // The art and title keep the opening episode's layoutId for the dialog's whole life. Remounting or
  // re-keying a layoutId element while open leaves framer-motion waiting on an exit that never
  // finishes, and the invisible dialog then stays mounted over the page.
  const [origin] = useState(() => ({ season: at.season, id: t.seasons[at.season].episodes[at.episode].id }));
  const closeBtn = useRef<HTMLButtonElement>(null);
  useDialog(root, onClose, closeBtn);

  const season = t.seasons[at.season];
  const ep = season.episodes[at.episode];
  const count = season.episodes.length;

  return (
    <motion.div ref={root} className="modal" role="dialog" aria-modal="true" aria-labelledby="episode-title">
      <motion.div className="modal-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.article className="modal-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: 30, transition: { duration: 0.25 } }}>
        <div className="modal-hero">
          <motion.div layoutId={`art-${origin.season}-${origin.id}`} className="modal-art" transition={{ duration: 0.6, ease: EASE }}>
            <PosterArt season={at.season} episode={at.episode} id={ep.id} />
          </motion.div>
          <button ref={closeBtn} type="button" className="icon-btn modal-close" onClick={onClose} aria-label={t.ui.closeEpisode}>
            ✕
          </button>
          <div className="modal-hero-copy">
            <p className="eyebrow mono">
              {code(at.season, at.episode)} · {season.title}
              {ep.date && ` · ${ep.date}`}
            </p>
            <motion.h2 id="episode-title" layoutId={`title-${origin.season}-${origin.id}`} className="modal-title" transition={{ duration: 0.6, ease: EASE }}>
              {ep.title}
            </motion.h2>
          </div>
        </div>

        <motion.div key={`${at.season}-${at.episode}-${t.ui.langLabel}`} className="modal-body" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } }} initial="hidden" animate="show">
          <motion.p variants={block} className="modal-tagline">
            {ep.tagline}
          </motion.p>
          <motion.p variants={block} className="modal-summary">
            {ep.summary}
          </motion.p>
          {ep.metrics && (
            <motion.div variants={block}>
              <Metrics items={ep.metrics} />
            </motion.div>
          )}
          {ep.points && (
            <motion.ul variants={block} className="points">
              {ep.points.map((p) => (
                <li key={p.slice(0, 32)}>{p}</li>
              ))}
            </motion.ul>
          )}
          {ep.tags && (
            <motion.ul variants={block} className="chips">
              {ep.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </motion.ul>
          )}
          <motion.div variants={block} className="actions">
            <button type="button" className="btn btn-primary" onClick={() => onPlay(at)}>
              <span aria-hidden>▶</span> {t.ui.play}
            </button>
            {ep.link && (
              <a className="btn" href={ep.link.href} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            )}
          </motion.div>
        </motion.div>

        <nav className="modal-nav" aria-label={season.title}>
          <button type="button" className="btn btn-ghost" disabled={at.episode === 0} onClick={() => onMove({ ...at, episode: at.episode - 1 })}>
            ← {t.ui.previous}
          </button>
          <span className="mono">
            {at.episode + 1} / {count}
          </span>
          <button type="button" className="btn btn-ghost" disabled={at.episode === count - 1} onClick={() => onMove({ ...at, episode: at.episode + 1 })}>
            {t.ui.next} →
          </button>
        </nav>
      </motion.article>
    </motion.div>
  );
}
